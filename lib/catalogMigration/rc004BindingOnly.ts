/**
 * RC-004 — writer binding-only (metadata comercial sem mutação pedagógica).
 */
import { createHash } from 'node:crypto';
import { assertBindingOnlyDiffAllowlist } from '@/lib/catalogMigration/bindingOnlyDiff';
import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import {
  evaluateCommercialContentApproval,
} from '@/lib/catalogMigration/commercialContentApproval';
import {
  issueServerCommercialApproval,
  isVerifiableHumanCommercialReviewer,
} from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import { resolveRiskScoringContextFromPacote } from '@/lib/catalogMigration/rc004RiskContext';
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';
import {
  isReclassifyResultWrapper,
  unwrapCatalogPayload,
} from '@/lib/catalogMigration/unwrapCatalogPayload';

const SHA256_HEX = /^[a-f0-9]{64}$/;

const FORBIDDEN_REVIEWER_EXACT = new Set(
  [
    'cursor',
    'chatgpt',
    'openai',
    'ai',
    'bot',
    'reviewer',
    'admin',
    'test',
    'test-reviewer',
    'placeholder',
    'fake',
  ].map((s) => s.toLowerCase()),
);

export type Rc004BindingManifestItem = {
  slug: string;
  expected_content_fingerprint: string;
};

export type Rc004BindingManifest = {
  items: Rc004BindingManifestItem[];
  micro_pilot_digest?: string;
  source_recovery_digest?: string;
};

export type ModuloEstudoBindingRow = {
  id: string;
  modulo_slug: string;
  titulo_aula: string;
  conteudo_json: unknown;
};

export type BindingOnlyRowStatus =
  | 'would_bind'
  | 'already_bound_valid'
  | 'failed'
  | 'skipped';

export type BindingOnlyRowResult = {
  slug: string;
  status: BindingOnlyRowStatus;
  code?: string;
  detail?: string;
  contentFingerprint?: string;
  stampSimulated?: boolean;
  pedagogicalFpInvariant?: boolean;
  diffAllowlistPass?: boolean;
  directApprovalPass?: boolean;
  casMode?: string;
  wouldUseCas?: boolean;
};

export type BindingOnlyBatchResult = {
  results: BindingOnlyRowResult[];
  totals: {
    total: number;
    would_bind: number;
    already_bound_valid: number;
    failed: number;
    skipped: number;
  };
  productionWrites: number;
};

export type BindingOnlyDataSource = {
  fetchRowBySlug(slug: string): Promise<ModuloEstudoBindingRow | null>;
};

export type BindingOnlyApplySink = {
  updateConteudoJsonCas(args: {
    id: string;
    expectedConteudoJson: unknown;
    nextConteudoJson: unknown;
  }): Promise<{ updated: boolean; error?: string }>;
  reReadRowBySlug(slug: string): Promise<ModuloEstudoBindingRow | null>;
};

export type BindingOnlyRunOptions = {
  reviewer: string;
  approvedAt: string;
  dryRun: boolean;
  failFast?: boolean;
  /** Somente com arquitetura CAS aprovada + confirmação explícita. */
  apply?: boolean;
  confirmProductionBinding?: boolean;
  allowApplyArchitecture?: boolean;
};

export type BindingOnlyManifestValidation =
  | { ok: true; manifest: Rc004BindingManifest }
  | { ok: false; errors: string[] };

export type CasDiscoveryResult = {
  primitive:
    | 'EXISTING_SAFE_CAS_AVAILABLE'
    | 'SAFE_CONDITIONAL_UPDATE_AVAILABLE'
    | 'EXISTING_TRANSACTIONAL_RPC_AVAILABLE'
    | 'NO_SAFE_EXISTING_CAS';
  mode: 'JSONB_EQUALITY_CONDITIONAL' | 'NONE';
  applyImplementationStatus:
    | 'READY'
    | 'BLOCKED_CAS_REQUIRES_SEPARATE_DECISION';
};

export function discoverBindingOnlyCasPrimitive(): CasDiscoveryResult {
  // Sem coluna version/revision nem RPC dedicada no schema atual.
  // JSONB equality no WHERE é a menor opção sem migration — requer validação em ambiente real.
  return {
    primitive: 'SAFE_CONDITIONAL_UPDATE_AVAILABLE',
    mode: 'JSONB_EQUALITY_CONDITIONAL',
    applyImplementationStatus: 'BLOCKED_CAS_REQUIRES_SEPARATE_DECISION',
  };
}

/** Gate operacional: CLI só habilita apply com aprovação arquitetural explícita. */
export function isBindingOnlyApplyOperationallyAllowed(): boolean {
  return process.env.RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED === 'true';
}

export function assertBindingOnlyReviewerPolicy(reviewer: string): string | null {
  const r = reviewer.trim();
  if (!r) return 'reviewer vazio';
  if (/^agent:/i.test(r)) return 'prefixo agent: proibido';
  if (/^human:/i.test(r)) return 'prefixo human: proibido';
  if (FORBIDDEN_REVIEWER_EXACT.has(r.toLowerCase())) return 'reviewer placeholder/genérico proibido';
  if (!isVerifiableHumanCommercialReviewer(r)) return 'reviewer não verificável';
  return null;
}

export function parseBindingOnlyManifest(raw: unknown): BindingOnlyManifestValidation {
  const errors: string[] = [];
  let envelope: Rc004BindingManifest;

  if (Array.isArray(raw)) {
    envelope = { items: raw as Rc004BindingManifestItem[] };
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as Rc004BindingManifest).items)) {
    envelope = raw as Rc004BindingManifest;
  } else {
    return { ok: false, errors: ['manifest deve ser array ou { items: [...] }'] };
  }

  if (envelope.items.length === 0) {
    errors.push('manifest vazio');
  }

  const slugs = new Set<string>();
  for (const [i, item] of envelope.items.entries()) {
    const slug = item.slug?.trim();
    if (!slug) errors.push(`items[${i}].slug vazio`);
    if (slug && slugs.has(slug)) errors.push(`slug duplicado: ${slug}`);
    if (slug) slugs.add(slug);
    const fp = item.expected_content_fingerprint?.trim();
    if (!fp || !SHA256_HEX.test(fp)) {
      errors.push(`items[${i}].expected_content_fingerprint inválido`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: envelope };
}

export function assertApprovedAtIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function hashSupabaseTarget(url: string | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    const ref = host.split('.')[0] ?? host;
    return createHash('sha256').update(ref).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

const TARGET_HASH_HEX = /^[a-f0-9]{16}$/i;

/** Gate operacional: CAS JSONB validado em ambiente non-prod real. */
export function isBindingOnlyCasLiveValidated(): boolean {
  return process.env.RC004_BINDING_ONLY_CAS_LIVE_VALIDATED === 'true';
}

export type WriterApplyModeReport = 'BLOCKED' | 'READY_CODE_ONLY';

/**
 * Relatório operacional — nunca emite READY nesta fase (apply Production não homologado).
 * BLOCKED: arquitetura de apply desarmada.
 * READY_CODE_ONLY: código possui caminho de apply; homologação CAS/Production pendente.
 */
export function resolveWriterApplyModeReport(options: {
  allowApplyArchitecture: boolean;
}): WriterApplyModeReport {
  if (!options.allowApplyArchitecture) return 'BLOCKED';
  return 'READY_CODE_ONLY';
}

export function assertExpectedSupabaseTargetHash(
  expectedHash: string | undefined,
  actualHash: string | null,
): string | null {
  const expected = expectedHash?.trim().toLowerCase();
  if (!expected) {
    return 'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED';
  }
  if (!TARGET_HASH_HEX.test(expected)) {
    return 'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED';
  }
  if (!actualHash || expected !== actualHash.toLowerCase()) {
    return 'RC004_BINDING_ONLY_TARGET_MISMATCH';
  }
  return null;
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function classifyRawShape(raw: unknown): 'PLAIN_PAYLOAD' | 'RECLASSIFY_WRAPPER' {
  return isReclassifyResultWrapper(raw) ? 'RECLASSIFY_WRAPPER' : 'PLAIN_PAYLOAD';
}

function reconstructPatchedRaw(raw: unknown, issuedPayload: unknown): unknown {
  if (classifyRawShape(raw) === 'RECLASSIFY_WRAPPER' && raw && typeof raw === 'object') {
    return { ...(raw as object), payload: issuedPayload };
  }
  return issuedPayload;
}

function resolveSubtopico(row: ModuloEstudoBindingRow, payload: unknown): string | undefined {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const meta = (payload as Record<string, unknown>).meta;
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      const sub = (meta as Record<string, unknown>).subtopico;
      if (typeof sub === 'string' && sub.trim()) return sub.trim();
    }
  }
  return row.titulo_aula?.trim() || undefined;
}

function isAlreadyBoundValid(
  payload: unknown,
  expectedFp: string,
  reviewer: string,
  risk: ReturnType<typeof scoreQuestaoRisk>,
): boolean {
  const approval = evaluateCommercialContentApproval(payload as never, expectedFp, risk);
  if (!approval.approved) return false;
  const ec = (payload as { meta?: { efficacy_contract?: { a4_reviewer?: string } } }).meta
    ?.efficacy_contract;
  return ec?.a4_reviewer === reviewer;
}

export async function runRc004BindingOnlyBatch(
  manifest: Rc004BindingManifest,
  dataSource: BindingOnlyDataSource,
  options: BindingOnlyRunOptions,
  applySink?: BindingOnlyApplySink,
): Promise<BindingOnlyBatchResult> {
  const results: BindingOnlyRowResult[] = [];
  let productionWrites = 0;
  const registry = loadHandcraftRegistry();
  const cas = discoverBindingOnlyCasPrimitive();

  const policyErr = assertBindingOnlyReviewerPolicy(options.reviewer);
  if (policyErr) {
    throw new Error(`REVIEWER_POLICY_BLOCKED: ${policyErr}`);
  }
  if (!assertApprovedAtIsoDate(options.approvedAt)) {
    throw new Error('approved-at inválido (YYYY-MM-DD)');
  }

  const wantsApply = options.apply === true && !options.dryRun;
  if (wantsApply) {
    if (!options.confirmProductionBinding) {
      throw new Error('PRODUCTION_BINDING_REQUIRES_EXPLICIT_CONFIRMATION');
    }
    if (!options.allowApplyArchitecture) {
      throw new Error('RC004_BINDING_ONLY_APPLY_BLOCKED_CAS_UNAVAILABLE');
    }
    if (!applySink) {
      throw new Error('RC004_BINDING_ONLY_APPLY_SINK_MISSING');
    }
  }

  for (const item of manifest.items) {
    const slug = item.slug;
    const expectedFp = item.expected_content_fingerprint;

    const row = await dataSource.fetchRowBySlug(slug);
    if (!row) {
      results.push({
        slug,
        status: 'failed',
        code: 'ROW_NOT_FOUND',
        detail: 'slug ausente no data source',
      });
      if (options.failFast) break;
      continue;
    }

    const raw = row.conteudo_json;
    const fpPre = fingerprintConteudoJson(raw);
    if (fpPre !== expectedFp) {
      results.push({
        slug,
        status: 'failed',
        code: 'EXPECTED_CONTENT_FINGERPRINT_MISMATCH',
        detail: `expected=${expectedFp.slice(0, 12)}… actual=${fpPre.slice(0, 12)}…`,
        contentFingerprint: fpPre,
      });
      if (options.failFast) break;
      continue;
    }

    const payload = unwrapCatalogPayload(raw) ?? raw;
    const subtopico = resolveSubtopico(row, payload);
    const found = subtopico ? findPacoteBySubtopico(registry, subtopico) : null;
    if (!found) {
      results.push({
        slug,
        status: 'failed',
        code: 'RC004_BINDING_ONLY_REGISTRY_NOT_FOUND',
        detail: subtopico
          ? `subtopico não encontrado no handcraft registry: ${subtopico}`
          : 'meta.subtopico e titulo_aula ausentes para resolver pacote',
      });
      if (options.failFast) break;
      continue;
    }
    const riskContext = resolveRiskScoringContextFromPacote(found.pacote);

    const readiness = auditQuestaoReadiness(payload as never, {
      slug,
      strict: true,
      strictV2Pedagogy: true,
      productionReady: riskContext.productionReady,
      autoApprovalEnabled: riskContext.autoApprovalEnabled,
    });
    const risk = readiness.risk ?? scoreQuestaoRisk(payload as never, riskContext);

    if (isAlreadyBoundValid(payload, fpPre, options.reviewer, risk)) {
      results.push({
        slug,
        status: 'already_bound_valid',
        contentFingerprint: fpPre,
        stampSimulated: true,
        pedagogicalFpInvariant: true,
        diffAllowlistPass: true,
        directApprovalPass: true,
        casMode: cas.mode,
        wouldUseCas: false,
      });
      continue;
    }

    const signed = deepClone(payload) as Record<string, unknown>;
    const meta = (signed.meta as Record<string, unknown>) ?? {};
    meta.efficacy_contract = {
      ...((meta.efficacy_contract as Record<string, unknown>) ?? {}),
      a4_reviewed: true,
      a4_reviewer: options.reviewer,
    };
    signed.meta = meta;

    const issued = issueServerCommercialApproval({
      payload: signed as never,
      slug,
      riskContext,
      approvedAt: options.approvedAt,
    });

    if (!issued.stamped) {
      results.push({
        slug,
        status: 'failed',
        code: 'COMMERCIAL_APPROVAL_NOT_STAMPED',
        detail: issued.reason ?? 'stamped=false',
        contentFingerprint: fpPre,
        stampSimulated: false,
      });
      if (options.failFast) break;
      continue;
    }

    if (issued.contentFingerprint !== fpPre) {
      results.push({
        slug,
        status: 'failed',
        code: 'STAMP_FINGERPRINT_MISMATCH',
        detail: 'issued.contentFingerprint !== FP_PRE',
        contentFingerprint: fpPre,
        stampSimulated: false,
      });
      if (options.failFast) break;
      continue;
    }

    const patchedRaw = reconstructPatchedRaw(raw, issued.payload);
    const fpPost = fingerprintConteudoJson(patchedRaw);
    if (fpPost !== fpPre || fpPost !== expectedFp) {
      results.push({
        slug,
        status: 'failed',
        code: 'PEDAGOGICAL_FINGERPRINT_CHANGED',
        detail: `pre=${fpPre.slice(0, 12)}… post=${fpPost.slice(0, 12)}…`,
        contentFingerprint: fpPre,
        stampSimulated: true,
        pedagogicalFpInvariant: false,
      });
      if (options.failFast) break;
      continue;
    }

    const prePayload = unwrapCatalogPayload(raw) ?? raw;
    const postPayload = unwrapCatalogPayload(patchedRaw) ?? patchedRaw;
    const diff = assertBindingOnlyDiffAllowlist(prePayload, postPayload);
    if (!diff.ok) {
      results.push({
        slug,
        status: 'failed',
        code: 'BINDING_ONLY_DIFF_VIOLATION',
        detail: [...diff.structuralViolations, ...diff.allowlistViolations].slice(0, 4).join('; '),
        contentFingerprint: fpPre,
        stampSimulated: true,
        pedagogicalFpInvariant: true,
        diffAllowlistPass: false,
      });
      if (options.failFast) break;
      continue;
    }

    const direct = evaluateCommercialContentApproval(issued.payload as never, fpPost, risk);
    if (!direct.approved) {
      results.push({
        slug,
        status: 'failed',
        code: direct.reason ?? 'DIRECT_APPROVAL_FAILED',
        detail: direct.detail,
        contentFingerprint: fpPre,
        stampSimulated: true,
        pedagogicalFpInvariant: true,
        diffAllowlistPass: true,
        directApprovalPass: false,
      });
      if (options.failFast) break;
      continue;
    }

    if (wantsApply && applySink) {
      const casResult = await applySink.updateConteudoJsonCas({
        id: row.id,
        expectedConteudoJson: raw,
        nextConteudoJson: patchedRaw,
      });
      if (!casResult.updated) {
        results.push({
          slug,
          status: 'failed',
          code: 'CAS_CONFLICT',
          detail: casResult.error ?? 'UPDATE condicional não afetou linha',
          contentFingerprint: fpPre,
        });
        if (options.failFast) break;
        continue;
      }
      productionWrites += 1;

      const reRead = await applySink.reReadRowBySlug(slug);
      if (!reRead) {
        results.push({
          slug,
          status: 'failed',
          code: 'POST_WRITE_VERIFICATION_FAILED',
          detail: 're-read ausente',
        });
        if (options.failFast) break;
        continue;
      }
      const persistedFp = fingerprintConteudoJson(reRead.conteudo_json);
      if (persistedFp !== expectedFp) {
        results.push({
          slug,
          status: 'failed',
          code: 'POST_WRITE_VERIFICATION_FAILED',
          detail: 'fingerprint pós-write diverge',
          contentFingerprint: persistedFp,
        });
        if (options.failFast) break;
        continue;
      }
      const rePayload = unwrapCatalogPayload(reRead.conteudo_json) ?? reRead.conteudo_json;
      const postApproval = evaluateCommercialContentApproval(rePayload as never, persistedFp, risk);
      if (!postApproval.approved) {
        results.push({
          slug,
          status: 'failed',
          code: 'POST_WRITE_VERIFICATION_FAILED',
          detail: postApproval.reason,
        });
        if (options.failFast) break;
        continue;
      }
    }

    results.push({
      slug,
      status: wantsApply ? 'would_bind' : 'would_bind',
      contentFingerprint: fpPre,
      stampSimulated: true,
      pedagogicalFpInvariant: true,
      diffAllowlistPass: true,
      directApprovalPass: true,
      casMode: cas.mode,
      wouldUseCas: cas.mode === 'JSONB_EQUALITY_CONDITIONAL',
    });
  }

  const totals = {
    total: results.length,
    would_bind: results.filter((r) => r.status === 'would_bind').length,
    already_bound_valid: results.filter((r) => r.status === 'already_bound_valid').length,
    failed: results.filter((r) => r.status === 'failed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
  };

  return { results, totals, productionWrites };
}
