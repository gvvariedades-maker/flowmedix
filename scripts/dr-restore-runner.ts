import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
import {
  BackupEngine,
  type AuthenticatedDrSnapshotEnvelope,
} from './backup-automation';
import {
  assertNonProductionRestoreTarget,
  buildRestorePlan,
  parseRecoveryLedger,
  type DrRestorePlan,
} from '../lib/backup/drRestore';
import {
  applyDrRestoreToDatabase,
  preflightCasLedger,
  STORAGE_BLOBS_STATUS,
} from '../lib/backup/drRestoreApply';
import {
  CAS_PROJECT_REF,
  createPgDrRestoreClient,
  extractSupabaseProjectRefFromDatabaseUrl,
} from '../lib/backup/drRestoreDb';
import {
  CANONICAL_VAULT_BUCKET,
  PROD_PROJECT_REF,
  sendS3Request,
  validateAllowlist,
  ALLOWED_MANAGEMENT_SQL_PATH,
} from './dr-backup-runner';

export interface DrRestoreRunnerConfig {
  masterKek: string;
  envelopePath?: string;
  r2ObjectKey?: string;
  cloudflareAccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  restoreDatabaseUrl?: string;
  apply: boolean;
  reportPath?: string;
  drillReportPath?: string;
}

export interface DrRestoreDrillReport {
  gate: 'G-DR-RESTORE';
  status: 'PASS' | 'FAIL';
  mode: 'dry-run' | 'apply';
  PRODUCTION_MUTATION: 0;
  target_project_ref: string | null;
  snapshot_id: string;
  sequence_id: number;
  source_project_id: string;
  r2_object_key?: string;
  ciphertext_sha256: string;
  gates: Record<string, string>;
  inventory_expected: DrRestorePlan['inventory'];
  counts_after?: Record<string, unknown>;
  apply_errors?: string[];
  ledger_preflight?: {
    cas_migration_count: number;
    snapshot_migration_count: number;
    missing_versions: string[];
  };
  STORAGE_BLOBS: string;
}

export async function loadEnvelopeFromFile(filePath: string): Promise<AuthenticatedDrSnapshotEnvelope> {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as AuthenticatedDrSnapshotEnvelope;
}

export async function loadEnvelopeFromR2(config: DrRestoreRunnerConfig): Promise<AuthenticatedDrSnapshotEnvelope> {
  if (!config.r2ObjectKey) throw new Error('[FAIL_CLOSED] --r2-key is required for R2 fetch.');
  if (!config.cloudflareAccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    throw new Error('[FAIL_CLOSED] R2 credentials missing for envelope download.');
  }
  validateAllowlist(
    PROD_PROJECT_REF,
    ALLOWED_MANAGEMENT_SQL_PATH,
    CANONICAL_VAULT_BUCKET,
    config.r2ObjectKey,
  );

  const getRes = await sendS3Request({
    method: 'GET',
    accountId: config.cloudflareAccountId,
    bucket: CANONICAL_VAULT_BUCKET,
    key: config.r2ObjectKey,
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  });

  if (getRes.status !== 200) {
    throw new Error(`[FAIL_CLOSED] R2 GET failed HTTP ${getRes.status}`);
  }

  return JSON.parse(getRes.body.toString('utf8')) as AuthenticatedDrSnapshotEnvelope;
}

export function buildDrillReportBase(
  config: DrRestoreRunnerConfig,
  plan: DrRestorePlan,
  mode: 'dry-run' | 'apply',
): DrRestoreDrillReport {
  return {
    gate: 'G-DR-RESTORE',
    status: 'PASS',
    mode,
    PRODUCTION_MUTATION: 0,
    target_project_ref: config.restoreDatabaseUrl
      ? extractSupabaseProjectRefFromDatabaseUrl(config.restoreDatabaseUrl)
      : null,
    snapshot_id: plan.envelope_identity.snapshot_id,
    sequence_id: plan.envelope_identity.sequence_id,
    source_project_id: plan.envelope_identity.project_id,
    r2_object_key: config.r2ObjectKey,
    ciphertext_sha256: plan.envelope_identity.ciphertext_sha256,
    gates: { ...plan.gates },
    inventory_expected: plan.inventory,
    STORAGE_BLOBS: STORAGE_BLOBS_STATUS,
  };
}

export async function runDrRestore(config: DrRestoreRunnerConfig): Promise<{
  status: 'PASS' | 'FAIL';
  mode: 'dry-run' | 'apply';
  plan: DrRestorePlan;
  apply?: Awaited<ReturnType<typeof applyDrRestoreToDatabase>>;
}> {
  if (!config.masterKek) {
    throw new Error('[FAIL_CLOSED] AVANT_MASTER_KEK is required.');
  }

  let envelope: AuthenticatedDrSnapshotEnvelope;
  if (config.envelopePath) {
    envelope = await loadEnvelopeFromFile(config.envelopePath);
  } else if (config.r2ObjectKey) {
    envelope = await loadEnvelopeFromR2(config);
  } else {
    throw new Error('[FAIL_CLOSED] Provide --envelope=<path> or --r2-key=<daily/...avantdr>.');
  }

  const engine = new BackupEngine(config.masterKek);
  const { manifest, components } = engine.decryptAndVerifyDrSnapshot(envelope);
  const plan = buildRestorePlan(envelope, manifest, components);

  const mode = config.apply ? 'apply' : 'dry-run';
  const drillPath = config.drillReportPath ?? 'artifacts/dr-restore-drill.json';
  const report = buildDrillReportBase(config, plan, mode);

  if (config.restoreDatabaseUrl) {
    assertNonProductionRestoreTarget(config.restoreDatabaseUrl);
    const ledger = parseRecoveryLedger(components.get('recovery_metadata_ledger')!);
    const client = await createPgDrRestoreClient(config.restoreDatabaseUrl);
    try {
      const preflight = await preflightCasLedger(client, ledger);
      report.ledger_preflight = {
        cas_migration_count: preflight.cas_migration_count,
        snapshot_migration_count: preflight.snapshot_migration_count,
        missing_versions: preflight.missing_versions,
      };
      report.gates.LEDGER_PREFLIGHT = preflight.ledger_ready ? 'PASS' : 'FAIL';
    } finally {
      await client.end();
    }
  }

  if (config.apply) {
    if (!config.restoreDatabaseUrl) {
      throw new Error('[FAIL_CLOSED] --apply requires DR_RESTORE_DATABASE_URL (non-Production).');
    }
    assertNonProductionRestoreTarget(config.restoreDatabaseUrl);

    const targetRef = extractSupabaseProjectRefFromDatabaseUrl(config.restoreDatabaseUrl);
    if (targetRef !== CAS_PROJECT_REF) {
      throw new Error(
        `[FAIL_CLOSED] DR restore apply is only authorized for CAS project "${CAS_PROJECT_REF}", got "${targetRef ?? 'unknown'}".`,
      );
    }

    const client = await createPgDrRestoreClient(config.restoreDatabaseUrl);
    try {
      const applyResult = await applyDrRestoreToDatabase(client, components);
      report.gates = { ...report.gates, ...applyResult.gates };
      report.counts_after = {
        auth_users: applyResult.smoke.auth_users,
        auth_identities: applyResult.smoke.auth_identities,
        auth_mfa_factors: applyResult.smoke.auth_mfa_factors,
        public_table_counts: applyResult.smoke.public_table_counts,
        modulos_estudo:
          applyResult.smoke.public_table_counts.modulos_estudo ??
          applyResult.smoke.public_table_counts['modulos_estudo'],
      };
      report.apply_errors = applyResult.errors.length > 0 ? applyResult.errors : undefined;
      report.status = applyResult.status;
      report.mode = 'apply';

      const dir = path.dirname(drillPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(drillPath, JSON.stringify(report, null, 2), 'utf8');

      if (applyResult.status !== 'PASS') {
        return { status: 'FAIL', mode, plan, apply: applyResult };
      }

      return { status: 'PASS', mode, plan, apply: applyResult };
    } finally {
      await client.end();
    }
  }

  if (config.reportPath) {
    const dir = path.dirname(config.reportPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      config.reportPath,
      JSON.stringify({ status: 'PASS', mode, plan, ledger_preflight: report.ledger_preflight }, null, 2),
      'utf8',
    );
  }

  const dir = path.dirname(drillPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(drillPath, JSON.stringify(report, null, 2), 'utf8');

  return { status: 'PASS', mode, plan };
}

if (process.argv[1]?.endsWith('dr-restore-runner.ts')) {
  const envelopeArg = process.argv.find((a) => a.startsWith('--envelope='));
  const r2KeyArg = process.argv.find((a) => a.startsWith('--r2-key='));
  const reportArg = process.argv.find((a) => a.startsWith('--report='));
  const drillArg = process.argv.find((a) => a.startsWith('--drill-report='));
  const apply = process.argv.includes('--apply');

  const config: DrRestoreRunnerConfig = {
    masterKek: process.env.AVANT_MASTER_KEK || '',
    envelopePath: envelopeArg?.split('=')[1],
    r2ObjectKey: r2KeyArg?.split('=')[1],
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    restoreDatabaseUrl: process.env.DR_RESTORE_DATABASE_URL,
    apply,
    reportPath: reportArg?.split('=')[1] || 'artifacts/dr-restore-plan.json',
    drillReportPath: drillArg?.split('=')[1] || 'artifacts/dr-restore-drill.json',
  };

  runDrRestore(config)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'PASS' ? 0 : 1);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
      process.exit(1);
    });
}
