import type { AuthenticatedDrSnapshotEnvelope, SnapshotInnerManifest } from '@/scripts/backup-automation';
import { PROD_PROJECT_REF } from '@/scripts/dr-backup-runner';

export const REQUIRED_DR_COMPONENTS = [
  'database_public_data',
  'auth_sensitive_vault',
  'storage_figures_archive',
  'recovery_metadata_ledger',
] as const;

export type DrComponentName = (typeof REQUIRED_DR_COMPONENTS)[number];

export interface AuthVaultPayload {
  users: Record<string, unknown>[];
  identities: Record<string, unknown>[];
  mfa_factors: Record<string, unknown>[];
  writableCols: Record<string, string[]>;
}

export interface RecoveryLedgerPayload {
  baseline?: string;
  migration_count: number;
  ledger: { version: string; name?: string }[];
  project_id: string;
}

export interface DrRestoreInventory {
  snapshot_id: string;
  sequence_id: number;
  project_id: string;
  gfs_tier: string;
  created_at: string;
  public_table_count: number;
  public_row_count: number;
  auth_users: number;
  auth_identities: number;
  auth_mfa_factors: number;
  storage_figure_metadata_rows: number;
  migration_ledger_rows: number;
}

export interface DrRestorePlan {
  envelope_identity: {
    snapshot_id: string;
    sequence_id: number;
    project_id: string;
    gfs_tier: string;
    created_at: string;
    ciphertext_sha256: string;
  };
  inventory: DrRestoreInventory;
  component_sha256: Record<DrComponentName, string>;
  gates: Record<string, 'PASS' | 'FAIL'>;
}

/** Blocks restore targets that point at canonical Production Supabase. */
export function assertNonProductionRestoreTarget(databaseUrl: string): void {
  const normalized = databaseUrl.toLowerCase();
  const forbidden = [
    PROD_PROJECT_REF,
    `${PROD_PROJECT_REF}.supabase.co`,
    'ozgouenqrofnvgrlgfwd.supabase.co',
  ];
  for (const token of forbidden) {
    if (normalized.includes(token)) {
      throw new Error(
        `[FAIL_CLOSED] DR restore target must not reference Production project "${PROD_PROJECT_REF}".`,
      );
    }
  }
}

export function assertEnvelopeProjectBinding(
  envelope: AuthenticatedDrSnapshotEnvelope,
  manifest: SnapshotInnerManifest,
  expectedProjectId: string = PROD_PROJECT_REF,
): void {
  if (envelope.project_id !== expectedProjectId) {
    throw new Error(
      `[FAIL_CLOSED] Envelope project_id "${envelope.project_id}" does not match expected "${expectedProjectId}".`,
    );
  }
  if (manifest.project_id !== expectedProjectId) {
    throw new Error(
      `[FAIL_CLOSED] Inner manifest project_id "${manifest.project_id}" does not match expected "${expectedProjectId}".`,
    );
  }
  if (envelope.snapshot_id !== manifest.snapshot_id || envelope.sequence_id !== manifest.sequence_id) {
    throw new Error('[FAIL_CLOSED] Envelope/manifest snapshot identity mismatch.');
  }
}

export function parseAuthVault(buffer: Buffer): AuthVaultPayload {
  const parsed = JSON.parse(buffer.toString('utf8')) as AuthVaultPayload;
  if (!Array.isArray(parsed.users) || !Array.isArray(parsed.identities) || !Array.isArray(parsed.mfa_factors)) {
    throw new Error('[FAIL_CLOSED] auth_sensitive_vault payload missing users/identities/mfa_factors arrays.');
  }
  return parsed;
}

export function parsePublicData(buffer: Buffer): Record<string, unknown[]> {
  const parsed = JSON.parse(buffer.toString('utf8')) as Record<string, unknown[]>;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('[FAIL_CLOSED] database_public_data must be a JSON object keyed by table name.');
  }
  return parsed;
}

export function parseRecoveryLedger(buffer: Buffer): RecoveryLedgerPayload {
  const parsed = JSON.parse(buffer.toString('utf8')) as RecoveryLedgerPayload;
  if (!Array.isArray(parsed.ledger)) {
    throw new Error('[FAIL_CLOSED] recovery_metadata_ledger missing ledger array.');
  }
  return parsed;
}

export function buildRestoreInventory(
  envelope: AuthenticatedDrSnapshotEnvelope,
  manifest: SnapshotInnerManifest,
  components: Map<string, Buffer>,
): DrRestoreInventory {
  for (const name of REQUIRED_DR_COMPONENTS) {
    if (!components.has(name)) {
      throw new Error(`[FAIL_CLOSED] Missing required component "${name}".`);
    }
  }

  const publicData = parsePublicData(components.get('database_public_data')!);
  const authVault = parseAuthVault(components.get('auth_sensitive_vault')!);
  const storageMeta = JSON.parse(components.get('storage_figures_archive')!.toString('utf8')) as unknown[];
  const ledger = parseRecoveryLedger(components.get('recovery_metadata_ledger')!);

  let publicRowCount = 0;
  for (const rows of Object.values(publicData)) {
    if (Array.isArray(rows)) publicRowCount += rows.length;
  }

  return {
    snapshot_id: manifest.snapshot_id,
    sequence_id: manifest.sequence_id,
    project_id: manifest.project_id,
    gfs_tier: manifest.gfs_tier,
    created_at: manifest.created_at,
    public_table_count: Object.keys(publicData).length,
    public_row_count: publicRowCount,
    auth_users: authVault.users.length,
    auth_identities: authVault.identities.length,
    auth_mfa_factors: authVault.mfa_factors.length,
    storage_figure_metadata_rows: Array.isArray(storageMeta) ? storageMeta.length : 0,
    migration_ledger_rows: ledger.ledger.length,
  };
}

export function buildRestorePlan(
  envelope: AuthenticatedDrSnapshotEnvelope,
  manifest: SnapshotInnerManifest,
  components: Map<string, Buffer>,
): DrRestorePlan {
  assertEnvelopeProjectBinding(envelope, manifest);
  const inventory = buildRestoreInventory(envelope, manifest, components);

  const component_sha256 = {} as Record<DrComponentName, string>;
  for (const comp of manifest.components) {
    if ((REQUIRED_DR_COMPONENTS as readonly string[]).includes(comp.name)) {
      component_sha256[comp.name as DrComponentName] = comp.plaintext_sha256;
    }
  }

  return {
    envelope_identity: {
      snapshot_id: envelope.snapshot_id,
      sequence_id: envelope.sequence_id,
      project_id: envelope.project_id,
      gfs_tier: envelope.gfs_tier,
      created_at: envelope.created_at,
      ciphertext_sha256: envelope.ciphertext_sha256,
    },
    inventory,
    component_sha256,
    gates: {
      ENVELOPE_PROJECT_BINDING: 'PASS',
      REQUIRED_COMPONENTS_PRESENT: 'PASS',
      INVENTORY_BUILT: 'PASS',
    },
  };
}
