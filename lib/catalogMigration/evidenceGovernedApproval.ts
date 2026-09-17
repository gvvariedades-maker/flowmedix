/**
 * EVIDENCE_GOVERNED_APPROVAL_V2 — revisão editorial de alto risco por evidência externa.
 *
 * A questão NÃO pode autoafirmar aprovação; artefatos são validados no apply/dry-run.
 *
 * @see docs/DECISAO_APROVACAO_POR_EVIDENCIA_V2.md
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, resolve, relative, sep } from 'node:path';
import { z } from 'zod';

export const EVIDENCE_POLICY_ID = 'EVIDENCE_GOVERNED_APPROVAL_V2';

const AGENT_REVIEWER_RE = /^agent:[a-zA-Z0-9][a-zA-Z0-9._-]{2,127}$/;

const ConfidenceSchema = z.enum(['alta', 'media', 'baixa']);

const SourceVerificationSchema = z.object({
  performed: z.literal(true),
  vigency_checked: z.literal(true),
  applicability_checked: z.literal(true),
  conflict_search_performed: z.literal(true),
});

const ClaimSchema = z.object({
  claim_id: z.string().min(1).max(120),
  claim: z.string().min(1).max(2000),
  critical: z.boolean(),
  supported: z.boolean(),
  source_ids: z.array(z.string().min(1)).default([]),
  notes: z.string().max(2000).optional(),
});

const AgentReviewSchema = z.object({
  schema_version: z.literal('1.0'),
  review_type: z.enum(['primary', 'adversarial']),
  review_id: z.string().min(8).max(120),
  reviewer_id: z.string().min(8).max(160),
  p0_id: z.string().optional(),
  slug: z.string().min(1).max(300),
  candidate_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT']),
  confidence: ConfidenceSchema,
  answer_verified: z.boolean(),
  pedagogy_verified: z.boolean(),
  source_verification: SourceVerificationSchema,
  claims: z.array(ClaimSchema).default([]),
  findings: z.array(z.string().max(2000)).default([]),
  blockers: z.array(z.string().max(2000)).default([]),
  unresolved_disagreements: z.array(z.string().max(2000)).optional().default([]),
});

export type AgentReviewArtifact = z.infer<typeof AgentReviewSchema>;

const EvidenceManifestItemSchema = z.object({
  slug: z.string().min(1).max(300),
  candidate_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  primary_review_path: z.string().min(1).max(500),
  adversarial_review_path: z.string().min(1).max(500),
});

export const EvidenceManifestSchema = z.object({
  schema_version: z.literal('1.0'),
  policy: z.literal(EVIDENCE_POLICY_ID),
  items: z.array(EvidenceManifestItemSchema).min(1),
});

export type EvidenceManifest = z.infer<typeof EvidenceManifestSchema>;

export type EvidenceVerificationStatus =
  | 'PASS'
  | 'BLOCKED'
  | 'HUMAN_ESCALATION_REQUIRED'
  | 'STALE'
  | 'MISSING';

export type EvidenceVerificationResult = {
  approved: boolean;
  status: EvidenceVerificationStatus;
  codes: string[];
  reasons: string[];
  primary_review_id?: string;
  adversarial_review_id?: string;
  candidate_sha256?: string;
  human_escalation_required: boolean;
};

export type TrustedEvidenceApproval = {
  status: 'PASS';
  primary_review_id: string;
  adversarial_review_id: string;
  candidate_sha256: string;
  codes: string[];
};

/** SHA-256 canônico do candidato editorial (payload JSON completo). */
export function computeCandidateSha256(candidate: unknown): string {
  return createHash('sha256').update(JSON.stringify(candidate ?? null), 'utf8').digest('hex');
}

function sha256FileHex(absPath: string): string {
  const buf = readFileSync(absPath);
  return createHash('sha256').update(buf).digest('hex');
}

const ALLOWED_EVIDENCE_ROOTS = [
  'artifacts/p0-remediation-candidates',
  'artifacts/evidence-reviews',
  'artifacts/human-review',
] as const;

/**
 * Resolve path de artefato somente dentro de raízes permitidas no repo (anti-traversal).
 */
function isPathUnderAllowedRoots(relNorm: string): boolean {
  return ALLOWED_EVIDENCE_ROOTS.some(
    (prefix) => relNorm === prefix || relNorm.startsWith(`${prefix}/`),
  );
}

export function resolveSafeEvidenceArtifactPath(
  repoRoot: string,
  userPath: string,
): { ok: true; absPath: string } | { ok: false; code: string; reason: string } {
  const root = resolve(repoRoot);
  let rootReal: string;
  try {
    rootReal = realpathSync.native ? realpathSync.native(root) : realpathSync(root);
  } catch {
    return { ok: false, code: 'EVIDENCE_REPO_ROOT_INVALID', reason: `Repo root inválido: ${repoRoot}` };
  }

  const candidate = isAbsolute(userPath) ? resolve(userPath) : resolve(root, userPath);
  const rel = relative(root, candidate);
  if (rel.startsWith(`..${sep}`) || rel === '..') {
    return { ok: false, code: 'EVIDENCE_PATH_TRAVERSAL', reason: `Path fora do repo: ${userPath}` };
  }
  const relNorm = rel.split(sep).join('/');
  if (!isPathUnderAllowedRoots(relNorm)) {
    return {
      ok: false,
      code: 'EVIDENCE_PATH_NOT_ALLOWED',
      reason: `Path não está em raiz permitida (${ALLOWED_EVIDENCE_ROOTS.join(', ')}): ${userPath}`,
    };
  }
  if (!existsSync(candidate)) {
    return { ok: false, code: 'EVIDENCE_FILE_MISSING', reason: `Artefato não encontrado: ${userPath}` };
  }

  let absReal: string;
  try {
    absReal = realpathSync.native ? realpathSync.native(candidate) : realpathSync(candidate);
  } catch {
    return { ok: false, code: 'EVIDENCE_FILE_MISSING', reason: `Artefato não resolvível: ${userPath}` };
  }

  const relReal = relative(rootReal, absReal);
  const relRealNorm = relReal.split(sep).join('/');
  if (relReal.startsWith(`..${sep}`) || relReal === '..') {
    return {
      ok: false,
      code: 'EVIDENCE_PATH_SYMLINK_ESCAPE',
      reason: `Symlink/junction aponta fora do repo: ${userPath}`,
    };
  }
  if (!isPathUnderAllowedRoots(relRealNorm)) {
    return {
      ok: false,
      code: 'EVIDENCE_PATH_NOT_ALLOWED',
      reason: `Path canônico fora da raiz permitida: ${userPath}`,
    };
  }

  return { ok: true, absPath: absReal };
}

export function loadAgentReviewArtifact(
  repoRoot: string,
  userPath: string,
): { ok: true; data: AgentReviewArtifact; fileSha256: string } | { ok: false; code: string; reason: string } {
  const resolved = resolveSafeEvidenceArtifactPath(repoRoot, userPath);
  if (!resolved.ok) return resolved;
  try {
    const raw = JSON.parse(readFileSync(resolved.absPath, 'utf8'));
    const parsed = AgentReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'EVIDENCE_REVIEW_SCHEMA_INVALID',
        reason: parsed.error.issues.map((i) => i.message).join('; '),
      };
    }
    return { ok: true, data: parsed.data, fileSha256: sha256FileHex(resolved.absPath) };
  } catch (e) {
    return {
      ok: false,
      code: 'EVIDENCE_REVIEW_PARSE_ERROR',
      reason: e instanceof Error ? e.message : 'parse error',
    };
  }
}

export function loadEvidenceManifest(
  repoRoot: string,
  userPath: string,
): { ok: true; data: EvidenceManifest } | { ok: false; code: string; reason: string } {
  const resolved = resolveSafeEvidenceArtifactPath(repoRoot, userPath);
  if (!resolved.ok) return resolved;
  try {
    const raw = JSON.parse(readFileSync(resolved.absPath, 'utf8'));
    const parsed = EvidenceManifestSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'EVIDENCE_MANIFEST_SCHEMA_INVALID',
        reason: parsed.error.issues.map((i) => i.message).join('; '),
      };
    }
    return { ok: true, data: parsed.data };
  } catch (e) {
    return {
      ok: false,
      code: 'EVIDENCE_MANIFEST_PARSE_ERROR',
      reason: e instanceof Error ? e.message : 'parse error',
    };
  }
}

function isValidAgentReviewerId(reviewerId: string): boolean {
  return AGENT_REVIEWER_RE.test(reviewerId.trim());
}

function validateSingleReview(
  review: AgentReviewArtifact,
  expectedType: 'primary' | 'adversarial',
  expectedSlug: string,
  expectedCandidateSha: string,
  fileSha256: string,
): string[] {
  const codes: string[] = [];
  if (review.review_type !== expectedType) {
    codes.push(`EVIDENCE_WRONG_REVIEW_TYPE_${expectedType}`);
  }
  if (review.slug !== expectedSlug) {
    codes.push('EVIDENCE_SLUG_MISMATCH');
  }
  if (review.candidate_sha256 !== expectedCandidateSha) {
    codes.push('EVIDENCE_CANDIDATE_HASH_MISMATCH');
  }
  if (!isValidAgentReviewerId(review.reviewer_id)) {
    codes.push('EVIDENCE_INVALID_REVIEWER_ID');
  }
  if (review.decision !== 'APPROVE') {
    codes.push(`EVIDENCE_DECISION_${review.decision}`);
  }
  if (review.confidence === 'baixa') {
    codes.push('EVIDENCE_CONFIDENCE_BAIXA');
  }
  if (review.confidence === 'media') {
    codes.push('EVIDENCE_CONFIDENCE_MEDIA_ESCALATE');
  }
  if (!review.answer_verified || !review.pedagogy_verified) {
    codes.push('EVIDENCE_PEDAGOGY_OR_ANSWER_NOT_VERIFIED');
  }
  if (review.blockers.length > 0) {
    codes.push('EVIDENCE_BLOCKERS_PRESENT');
  }
  if ((review.unresolved_disagreements ?? []).length > 0) {
    codes.push('EVIDENCE_UNRESOLVED_DISAGREEMENTS');
  }
  const sv = review.source_verification;
  if (
    !sv.performed ||
    !sv.vigency_checked ||
    !sv.applicability_checked ||
    !sv.conflict_search_performed
  ) {
    codes.push('EVIDENCE_SOURCE_VERIFICATION_INCOMPLETE');
  }
  for (const claim of review.claims) {
    if (claim.critical && !claim.supported) {
      codes.push(`EVIDENCE_CRITICAL_CLAIM_UNSUPPORTED:${claim.claim_id}`);
    }
    if (claim.critical && claim.source_ids.length === 0) {
      codes.push(`EVIDENCE_CRITICAL_CLAIM_NO_SOURCE:${claim.claim_id}`);
    }
  }
  if (!review.review_id.trim()) {
    codes.push('EVIDENCE_REVIEW_ID_EMPTY');
  }
  if (!fileSha256) {
    codes.push('EVIDENCE_ARTIFACT_HASH_MISSING');
  }
  return codes;
}

/**
 * Verificador determinístico — fail-closed.
 */
export function verifyEvidenceGovernedApproval(input: {
  slug: string;
  candidate: unknown;
  primaryReview: AgentReviewArtifact;
  primaryFileSha256: string;
  adversarialReview: AgentReviewArtifact;
  adversarialFileSha256: string;
}): EvidenceVerificationResult {
  const reasons: string[] = [];
  const codes: string[] = [];
  const candidateSha = computeCandidateSha256(input.candidate);

  if (input.primaryReview.candidate_sha256 !== candidateSha) {
    codes.push('EVIDENCE_CANDIDATE_STALE');
    reasons.push('candidate_sha256 do artefato não corresponde ao candidato atual (STALE).');
  }

  codes.push(
    ...validateSingleReview(
      input.primaryReview,
      'primary',
      input.slug,
      candidateSha,
      input.primaryFileSha256,
    ),
  );
  codes.push(
    ...validateSingleReview(
      input.adversarialReview,
      'adversarial',
      input.slug,
      candidateSha,
      input.adversarialFileSha256,
    ),
  );

  if (input.primaryReview.review_id === input.adversarialReview.review_id) {
    codes.push('EVIDENCE_DUPLICATE_REVIEW_ID');
  }
  if (input.primaryReview.reviewer_id === input.adversarialReview.reviewer_id) {
    codes.push('EVIDENCE_DUPLICATE_REVIEWER_ID');
  }
  if (input.primaryFileSha256 === input.adversarialFileSha256) {
    codes.push('EVIDENCE_DUPLICATE_ARTIFACT_HASH');
  }

  const escalationCodes = codes.filter(
    (c) =>
      c === 'EVIDENCE_CONFIDENCE_MEDIA_ESCALATE' ||
      c.startsWith('EVIDENCE_DECISION_REQUEST_CHANGES'),
  );
  const blockCodes = codes.filter(
    (c) => !escalationCodes.includes(c) && c !== 'EVIDENCE_CONFIDENCE_MEDIA_ESCALATE',
  );

  if (blockCodes.length === 0 && escalationCodes.length > 0) {
    return {
      approved: false,
      status: 'HUMAN_ESCALATION_REQUIRED',
      codes,
      reasons: reasons.length ? reasons : ['Confiança média ou mudanças solicitadas — escalonamento humano.'],
      primary_review_id: input.primaryReview.review_id,
      adversarial_review_id: input.adversarialReview.review_id,
      candidate_sha256: candidateSha,
      human_escalation_required: true,
    };
  }

  if (codes.some((c) => c === 'EVIDENCE_CANDIDATE_STALE' || c === 'EVIDENCE_CANDIDATE_HASH_MISMATCH')) {
    return {
      approved: false,
      status: 'STALE',
      codes,
      reasons: reasons.length ? reasons : ['Evidência stale — candidato alterado após revisão.'],
      primary_review_id: input.primaryReview.review_id,
      adversarial_review_id: input.adversarialReview.review_id,
      candidate_sha256: candidateSha,
      human_escalation_required: false,
    };
  }

  if (blockCodes.length > 0) {
    return {
      approved: false,
      status: 'BLOCKED',
      codes,
      reasons: reasons.length ? reasons : blockCodes.map((c) => `Falha: ${c}`),
      primary_review_id: input.primaryReview.review_id,
      adversarial_review_id: input.adversarialReview.review_id,
      candidate_sha256: candidateSha,
      human_escalation_required: blockCodes.some((c) =>
        c.includes('UNSUPPORTED') || c.includes('SOURCE') || c.includes('DISAGREEMENT'),
      ),
    };
  }

  return {
    approved: true,
    status: 'PASS',
    codes: ['EVIDENCE_GOVERNED_PASS'],
    reasons: ['Dupla revisão independente + fontes + claims críticos — PASS.'],
    primary_review_id: input.primaryReview.review_id,
    adversarial_review_id: input.adversarialReview.review_id,
    candidate_sha256: candidateSha,
    human_escalation_required: false,
  };
}

export function resolveTrustedEvidenceForSlug(input: {
  repoRoot: string;
  manifestPath: string;
  slug: string;
  candidate: unknown;
}): EvidenceVerificationResult {
  const manifestLoaded = loadEvidenceManifest(input.repoRoot, input.manifestPath);
  if (!manifestLoaded.ok) {
    return {
      approved: false,
      status: 'MISSING',
      codes: [manifestLoaded.code],
      reasons: [manifestLoaded.reason],
      human_escalation_required: false,
    };
  }

  const item = manifestLoaded.data.items.find((i) => i.slug === input.slug);
  if (!item) {
    return {
      approved: false,
      status: 'MISSING',
      codes: ['EVIDENCE_MANIFEST_ITEM_MISSING'],
      reasons: [`Slug ${input.slug} ausente no manifest de evidência.`],
      human_escalation_required: false,
    };
  }

  const candidateSha = computeCandidateSha256(input.candidate);
  if (item.candidate_sha256 !== candidateSha) {
    return {
      approved: false,
      status: 'STALE',
      codes: ['EVIDENCE_MANIFEST_CANDIDATE_STALE'],
      reasons: ['candidate_sha256 do manifest não corresponde ao candidato atual.'],
      candidate_sha256: candidateSha,
      human_escalation_required: false,
    };
  }

  const primaryLoaded = loadAgentReviewArtifact(input.repoRoot, item.primary_review_path);
  if (!primaryLoaded.ok) {
    return {
      approved: false,
      status: 'BLOCKED',
      codes: [primaryLoaded.code],
      reasons: [primaryLoaded.reason],
      human_escalation_required: false,
    };
  }

  const adversarialLoaded = loadAgentReviewArtifact(input.repoRoot, item.adversarial_review_path);
  if (!adversarialLoaded.ok) {
    return {
      approved: false,
      status: 'BLOCKED',
      codes: [adversarialLoaded.code],
      reasons: [adversarialLoaded.reason],
      human_escalation_required: false,
    };
  }

  return verifyEvidenceGovernedApproval({
    slug: input.slug,
    candidate: input.candidate,
    primaryReview: primaryLoaded.data,
    primaryFileSha256: primaryLoaded.fileSha256,
    adversarialReview: adversarialLoaded.data,
    adversarialFileSha256: adversarialLoaded.fileSha256,
  });
}

export function toTrustedEvidenceApproval(
  result: EvidenceVerificationResult,
): TrustedEvidenceApproval | null {
  if (!result.approved || result.status !== 'PASS') return null;
  if (!result.primary_review_id || !result.adversarial_review_id || !result.candidate_sha256) {
    return null;
  }
  return {
    status: 'PASS',
    primary_review_id: result.primary_review_id,
    adversarial_review_id: result.adversarial_review_id,
    candidate_sha256: result.candidate_sha256,
    codes: result.codes,
  };
}

/** Campos no payload que não podem auto-conceder aprovação por evidência. */
export function detectUntrustedEvidenceApprovalClaims(payload: {
  meta?: Record<string, unknown>;
}): Array<{ code: string; message: string; path: string }> {
  const issues: Array<{ code: string; message: string; path: string }> = [];
  const meta = payload.meta ?? {};
  const forbidden = [
    'evidence_approved',
    'agent_review_passed',
    'primary_review_passed',
    'adversarial_review_passed',
    'evidence_governed_approval',
  ];
  for (const key of forbidden) {
    if (meta[key] === true || meta[key] === 'PASS') {
      issues.push({
        code: 'evidence_approval_spoof_untrusted',
        message: `${key} não pode ser declarado no payload — evidência vem de artefatos externos.`,
        path: `meta.${key}`,
      });
    }
  }
  const ec = meta.efficacy_contract;
  if (ec && typeof ec === 'object') {
    const ecObj = ec as Record<string, unknown>;
    for (const key of ['evidence_approved', 'evidence_review_passed', 'evidence_governed_pass']) {
      if (ecObj[key] === true) {
        issues.push({
          code: 'evidence_approval_spoof_untrusted',
          message: `efficacy_contract.${key} não pode ser declarado em import/API.`,
          path: `meta.efficacy_contract.${key}`,
        });
      }
    }
  }
  return issues;
}
