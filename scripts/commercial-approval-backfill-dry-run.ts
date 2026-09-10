#!/usr/bin/env tsx
/**
 * RC-004 — Dry-run de backfill de approved_content_fingerprint.
 * NÃO escreve em DB, snapshots, Storage ou catálogo canônico.
 *
 * Uso:
 *   npm run commercial:approval-backfill-dry-run
 *   npm run commercial:approval-backfill-dry-run -- --jsonl=artifacts/catalog-reconciliation/ts_reconciliation_items_2026-09-08.jsonl
 *   npm run commercial:approval-backfill-dry-run -- --examples
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { evaluateCommercialContentApproval } from '@/lib/catalogMigration/commercialContentApproval';
import { fingerprintConteudoJson, CONTENT_FINGERPRINT_ALGORITHM_VERSION } from '@/lib/catalogMigration/contentFingerprint';
import { evaluateCommercialRuntimeApproval } from '@/lib/catalogMigration/commercialRuntimeGate';
import { isSlugInP0Denylist } from '@/lib/catalogMigration/p0Denylist';
import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { isVerifiableHumanCommercialReviewer } from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import { unwrapCatalogPayload } from '@/lib/catalogMigration/unwrapCatalogPayload';

export type BackfillClassification =
  | 'APPROVAL_EVIDENCE_VERIFIED'
  | 'PROXY_PRE_BINDING_LEGACY_RUNTIME'
  | 'AUTO_APPROVAL_VALID_PER_POLICY'
  | 'APPROVAL_EVIDENCE_MISSING'
  | 'APPROVAL_STALE'
  | 'APPROVAL_CONTRADICTORY'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'NOT_ELIGIBLE';

export type BackfillDryRunRow = {
  slug: string;
  question_id?: string;
  titulo_aula?: string | null;
  classification: BackfillClassification;
  content_fingerprint: string;
  fingerprint_algorithm: string;
  ready_100: boolean;
  runtime_approved: boolean;
  runtime_reason?: string;
  approval_authority?: string;
  approval_at?: string;
  stored_fingerprint?: string;
  fields_to_write?: string[];
  pre_write_hash_check: string;
  expected_after_write: 'COMMERCIAL_ELIGIBLE_IF_RUNTIME_PASSES';
  rollback: 'Remover meta.efficacy_contract.approved_content_fingerprint ou anchor_100_approval.approved_content_fingerprint';
  blockers: string[];
};

type InputRow = {
  id?: string;
  modulo_slug: string;
  titulo_aula?: string | null;
  conteudo_json?: unknown;
  reconciliation?: {
    readiness_ready_100?: string;
    runtime_rc004?: string;
    runtime_reason?: string;
    commercial_eligible?: string;
    golden_v1?: boolean;
  };
};

function rowFromReconciliationLine(parsed: Record<string, unknown>): InputRow {
  return {
    id: String(parsed.question_id ?? parsed.id ?? ''),
    modulo_slug: String(parsed.slug ?? parsed.modulo_slug ?? ''),
    titulo_aula: (parsed.titulo_aula as string | null) ?? null,
    reconciliation: {
      readiness_ready_100: String(parsed.readiness_ready_100 ?? ''),
      runtime_rc004: String(parsed.runtime_rc004 ?? ''),
      runtime_reason: String(parsed.runtime_reason ?? ''),
      commercial_eligible: String(parsed.commercial_eligible ?? ''),
      golden_v1: parsed.golden_v1 === true,
    },
  };
}

function classifyReconciliationOnly(row: InputRow): BackfillDryRunRow {
  const slug = row.modulo_slug;
  const rec = row.reconciliation!;
  const blockers: string[] = [];
  let classification: BackfillClassification = 'NOT_ELIGIBLE';

  if (isSlugInP0Denylist(slug)) blockers.push('P0_DENYLIST');

  const ready = rec.readiness_ready_100 === 'PASS';
  const runtimePass = rec.runtime_rc004 === 'PASS';

  if (!ready) {
    classification = 'NOT_ELIGIBLE';
    blockers.push('READINESS_NOT_READY_100');
  } else if (runtimePass && rec.commercial_eligible === 'PASS') {
    classification = 'PROXY_PRE_BINDING_LEGACY_RUNTIME';
    blockers.push(
      'LEGACY_RUNTIME_PASS_PRE_RC004C_BINDING — não equivale a evidência verificada pós-write-path',
    );
  } else if (runtimePass) {
    classification = 'PROXY_PRE_BINDING_LEGACY_RUNTIME';
    blockers.push('LEGACY_RUNTIME_PASS_WITHOUT_COMMERCIAL_ELIGIBLE_OR_PAYLOAD');
  } else if (rec.runtime_reason?.includes('MISMATCH')) {
    classification = 'APPROVAL_STALE';
    blockers.push(rec.runtime_reason);
  } else if (rec.runtime_reason?.includes('REVOKED')) {
    classification = 'APPROVAL_CONTRADICTORY';
    blockers.push(rec.runtime_reason);
  } else if (rec.runtime_reason?.includes('AUTHORITY') || rec.runtime_reason?.includes('GATE_BLOCKED')) {
    classification = 'REQUIRES_HUMAN_REVIEW';
    blockers.push(rec.runtime_reason);
  } else if (ready && !runtimePass) {
    classification = 'APPROVAL_EVIDENCE_MISSING';
    blockers.push(rec.runtime_reason ?? 'RUNTIME_FAIL');
  }

  return {
    slug,
    question_id: row.id,
    titulo_aula: row.titulo_aula,
    classification,
    content_fingerprint: 'metadata-only',
    fingerprint_algorithm: CONTENT_FINGERPRINT_ALGORITHM_VERSION,
    ready_100: ready,
    runtime_approved: runtimePass,
    runtime_reason: rec.runtime_reason,
    blockers,
    pre_write_hash_check: 'requires-export-with-conteudo_json',
    expected_after_write: 'COMMERCIAL_ELIGIBLE_IF_RUNTIME_PASSES',
    rollback:
      'Remover meta.efficacy_contract.approved_content_fingerprint ou anchor_100_approval.approved_content_fingerprint',
    fields_to_write:
      classification === 'APPROVAL_EVIDENCE_MISSING'
        ? [
            'meta.efficacy_contract.approved_content_fingerprint',
            'meta.efficacy_contract.a4_reviewer',
            'meta.efficacy_contract.auto_approved_at',
          ]
        : undefined,
  };
}

function parseArgs(): { jsonl?: string; examples: boolean; limit: number } {
  const args = process.argv.slice(2);
  let jsonl: string | undefined;
  let examples = false;
  let limit = 50_000;
  for (const a of args) {
    if (a.startsWith('--jsonl=')) jsonl = a.slice('--jsonl='.length);
    if (a === '--examples') examples = true;
    if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length)) || limit;
  }
  return { jsonl, examples, limit };
}

function classifyRow(row: InputRow): BackfillDryRunRow {
  if (!row.conteudo_json) {
    return classifyReconciliationOnly(row);
  }

  const slug = row.modulo_slug;
  const raw = row.conteudo_json;
  const payload = unwrapCatalogPayload(raw) ?? raw;
  const fp = fingerprintConteudoJson(raw);
  const meta = (payload as { meta?: Record<string, unknown> })?.meta ?? {};
  const ec = meta.efficacy_contract as Record<string, unknown> | undefined;
  const anchor = meta.anchor_100_approval as Record<string, unknown> | undefined;
  const storedFp = String(ec?.approved_content_fingerprint ?? anchor?.approved_content_fingerprint ?? '');
  const blockers: string[] = [];

  process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';

  if (isSlugInP0Denylist(slug)) {
    blockers.push('P0_DENYLIST');
  }

  const readiness = auditQuestaoReadiness(payload as never, {
    slug,
    strict: true,
    strictV2Pedagogy: true,
    productionReady: true,
  });

  const runtime = evaluateCommercialRuntimeApproval({
    slug,
    tituloAula: row.titulo_aula,
    conteudoJson: raw,
  });

  let classification: BackfillClassification = 'NOT_ELIGIBLE';

  if (blockers.length > 0 || !readiness.ready_100) {
    classification = 'NOT_ELIGIBLE';
    if (!readiness.ready_100) blockers.push('READINESS_NOT_READY_100');
  } else if (runtime.approved) {
    const humanOk =
      isVerifiableHumanCommercialReviewer(String(ec?.a4_reviewer ?? '')) ||
      (anchor?.status === 'pass' &&
        isVerifiableHumanCommercialReviewer(String(anchor.reviewer ?? '')));
    const bound = storedFp && storedFp === fp;
    if (humanOk && bound) {
      classification = 'APPROVAL_EVIDENCE_VERIFIED';
    } else if (
      !humanOk &&
      ec?.a4_reviewed === true &&
      readiness.risk?.approval_mode !== 'human_required'
    ) {
      classification = 'AUTO_APPROVAL_VALID_PER_POLICY';
      blockers.push('AUTO_TIER_EDITORIAL_SEM_BINDING_COMERCIAL_VERIFICADO');
    } else {
      classification = 'PROXY_PRE_BINDING_LEGACY_RUNTIME';
      blockers.push('RUNTIME_PASS_SEM_EVIDENCIA_HUMANA_VERIFICAVEL_OU_BINDING');
    }
  } else if (storedFp && storedFp !== fp) {
    classification = 'APPROVAL_STALE';
    blockers.push('FINGERPRINT_MISMATCH');
  } else if (
    anchor?.status === 'fail' ||
    anchor?.status === 'pending' ||
    anchor?.status === 'human_required'
  ) {
    classification = 'APPROVAL_CONTRADICTORY';
    blockers.push(`anchor_status=${anchor?.status}`);
  } else if (
    (ec?.a4_reviewed === true &&
      !isVerifiableHumanCommercialReviewer(String(ec?.a4_reviewer ?? ''))) ||
    (anchor?.status === 'pass' &&
      !isVerifiableHumanCommercialReviewer(String(anchor.reviewer ?? '')))
  ) {
    classification = 'REQUIRES_HUMAN_REVIEW';
    blockers.push('REVIEWER_NAO_VERIFICAVEL_OU_AGENT');
  } else if (!storedFp) {
    classification = 'APPROVAL_EVIDENCE_MISSING';
    blockers.push('NO_APPROVED_CONTENT_FINGERPRINT');
  } else {
    const approval = evaluateCommercialContentApproval(
      payload as never,
      fp,
      readiness.risk ?? {
        risk_tier: 'medio',
        approval_mode: 'auto_conditional',
        risk_factors: [],
        reasons: [],
      },
    );
    if (!approval.approved) {
      classification =
        approval.reason === 'APPROVAL_CONTENT_MISMATCH' ? 'APPROVAL_STALE' : 'APPROVAL_CONTRADICTORY';
      blockers.push(approval.reason ?? 'APPROVAL_DENIED');
    }
  }

  const fieldsToWrite =
    classification === 'APPROVAL_EVIDENCE_VERIFIED'
      ? []
      : classification === 'APPROVAL_EVIDENCE_MISSING' || classification === 'REQUIRES_HUMAN_REVIEW'
        ? [
            'meta.efficacy_contract.approved_content_fingerprint',
            'meta.efficacy_contract.a4_reviewed',
            'meta.efficacy_contract.a4_reviewer',
            'meta.efficacy_contract.auto_approved_at',
          ]
        : undefined;

  return {
    slug,
    question_id: row.id,
    titulo_aula: row.titulo_aula,
    classification,
    content_fingerprint: fp,
    fingerprint_algorithm: CONTENT_FINGERPRINT_ALGORITHM_VERSION,
    ready_100: readiness.ready_100,
    runtime_approved: runtime.approved,
    runtime_reason: runtime.reason,
    approval_authority: String(ec?.a4_reviewer ?? anchor?.reviewer ?? ''),
    approval_at: String(ec?.auto_approved_at ?? anchor?.reviewed_at ?? ''),
    stored_fingerprint: storedFp || undefined,
    fields_to_write: fieldsToWrite,
    pre_write_hash_check: fp,
    expected_after_write: 'COMMERCIAL_ELIGIBLE_IF_RUNTIME_PASSES',
    rollback:
      'Remover meta.efficacy_contract.approved_content_fingerprint ou anchor_100_approval.approved_content_fingerprint',
    blockers,
  };
}

async function loadJsonl(path: string, limit: number): Promise<InputRow[]> {
  const rows: InputRow[] = [];
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const parsed = JSON.parse(line) as Record<string, unknown>;
    if (parsed.conteudo_json) {
      rows.push({
        id: String(parsed.id ?? parsed.question_id ?? ''),
        modulo_slug: String(parsed.modulo_slug ?? parsed.slug ?? ''),
        titulo_aula: (parsed.titulo_aula as string | null) ?? null,
        conteudo_json: parsed.conteudo_json,
      });
    } else {
      rows.push(rowFromReconciliationLine(parsed));
    }
    if (rows.length >= limit) break;
  }
  return rows;
}

function loadExamples(): InputRow[] {
  const dir = resolve(process.cwd(), 'examples');
  const files = ['questao-premium-cpcon-imunizacao-intervalos-vf.json'];
  return files.map((f) => {
    const payload = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
    return {
      modulo_slug: f.replace('.json', ''),
      titulo_aula: payload.meta?.subtopico ?? 'Imunização',
      conteudo_json: payload,
    };
  });
}

async function main(): Promise<void> {
  const { jsonl, examples, limit } = parseArgs();
  let rows: InputRow[] = [];
  if (jsonl && existsSync(resolve(process.cwd(), jsonl))) {
    rows = await loadJsonl(resolve(process.cwd(), jsonl), limit);
  } else if (examples || !jsonl) {
    rows = loadExamples();
  } else {
    console.error(`JSONL não encontrado: ${jsonl}`);
    process.exit(1);
  }

  const results = rows.map(classifyRow);
  const summary = results.reduce(
    (acc, r) => {
      acc[r.classification] = (acc[r.classification] ?? 0) + 1;
      if (r.runtime_approved) acc.runtime_approved += 1;
      return acc;
    },
    {
      total: results.length,
      runtime_approved: 0,
    } as Record<string, number>,
  );

  const outDir = resolve(process.cwd(), 'artifacts/commercial-enforcement-integration');
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = resolve(outDir, `approval-backfill-dry-run-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        read_only: true,
        backfill_executed: false,
        fingerprint_algorithm: CONTENT_FINGERPRINT_ALGORITHM_VERSION,
        source: jsonl ?? 'examples',
        summary,
        rows: results,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  console.log(JSON.stringify({ outPath, summary }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
