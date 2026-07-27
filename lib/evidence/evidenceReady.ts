/**
 * Gate `evidence_ready` — Fase 2 (docs/DECISAO_EVIDENCE_ENGINE.md §10–§11).
 *
 * Uma questão só participa do Evidence Engine (CTA T1 / seleção adaptativa EE)
 * quando `evidence_ready = true`. Exigências (§10):
 *
 * - `primary_skill_id` definido;
 * - diagnóstico dos distratores revisado;
 * - pelo menos uma candidata inédita de transferência no inventário;
 * - diferença comprovada de molde superficial (`surface_template_id`);
 * - dificuldade compatível (`difficulty` presente);
 * - conteúdo validado (handcraft golden-v1 / trilho A);
 * - revisão humana (`human_review`) — questões sem `evidence_ready` seguem
 *   no fluxo legado até revisão humana confirmar (docs/EVIDENCE_FASE2_PILOTO_PT.md).
 *
 * `misconceptions` é anexado **quando possível** (soft requirement) — ausência
 * gera warning, não bloqueia o gate por si só, mas costuma coincidir com
 * `distractor_diagnoses_reviewed = false`.
 *
 * Sem I/O; não decide nada em runtime além de calcular o booleano/motivos.
 */

export const EVIDENCE_READY_MISSING_REASONS = [
  'missing_primary_skill_id',
  'missing_distractor_diagnoses_review',
  'missing_transfer_candidate',
  'missing_surface_template_id',
  'missing_difficulty',
  'missing_question_version',
  'missing_human_review',
  'missing_golden_v1_content_standard',
] as const;
export type EvidenceReadyMissingReason = (typeof EVIDENCE_READY_MISSING_REASONS)[number];

export const EVIDENCE_READY_WARNINGS = ['no_misconceptions_mapped'] as const;
export type EvidenceReadyWarning = (typeof EVIDENCE_READY_WARNINGS)[number];

export type EvidenceReadyInput = {
  primary_skill_id: string | null;
  difficulty: number | null;
  surface_template_id: string | null;
  question_version: string | null;
  /** Revisão humana explícita (§10) — nunca inferida automaticamente. */
  human_review: boolean;
  /** Conteúdo handcraft golden-v1 / trilho A (docs/DECISAO_TRILHO_A_UNICO.md). */
  content_standard_golden_v1: boolean;
  /** Diagnóstico dos distratores revisado (equivalente a `distractor_diagnoses`). */
  distractor_diagnoses_reviewed: boolean;
  /** Existe ao menos uma candidata inédita de transferência no inventário. */
  has_inedita_transfer_candidate: boolean;
  /** Códigos de misconception mapeados, quando possível (§10 pipeline offline). */
  misconception_codes: readonly string[];
};

export type EvidenceReadyResult = {
  evidence_ready: boolean;
  missing_reasons: EvidenceReadyMissingReason[];
  warnings: EvidenceReadyWarning[];
};

/**
 * Avalia o gate `evidence_ready` (§10). Puro: mesmo input → mesmo output.
 */
export function evaluateEvidenceReady(input: EvidenceReadyInput): EvidenceReadyResult {
  const missing: EvidenceReadyMissingReason[] = [];

  if (!input.primary_skill_id) {
    missing.push('missing_primary_skill_id');
  }
  if (!input.distractor_diagnoses_reviewed) {
    missing.push('missing_distractor_diagnoses_review');
  }
  if (!input.has_inedita_transfer_candidate) {
    missing.push('missing_transfer_candidate');
  }
  if (!input.surface_template_id) {
    missing.push('missing_surface_template_id');
  }
  if (input.difficulty === null || input.difficulty === undefined) {
    missing.push('missing_difficulty');
  }
  if (!input.question_version) {
    missing.push('missing_question_version');
  }
  if (!input.human_review) {
    missing.push('missing_human_review');
  }
  if (!input.content_standard_golden_v1) {
    missing.push('missing_golden_v1_content_standard');
  }

  const warnings: EvidenceReadyWarning[] = [];
  if (input.misconception_codes.length === 0) {
    warnings.push('no_misconceptions_mapped');
  }

  return {
    evidence_ready: missing.length === 0,
    missing_reasons: missing,
    warnings,
  };
}

/**
 * Snapshot dos metadados que, ao mudar, invalidam `evidence_ready` (§11):
 * `primary_skill_id`, misconceptions, `difficulty`, `surface_template_id`,
 * `question_version`. A questão precisa passar novamente pelo gate antes de
 * retornar ao inventário T1.
 */
export type EvidenceReadyMetadataSnapshot = {
  primary_skill_id: string | null;
  misconception_codes: readonly string[];
  difficulty: number | null;
  surface_template_id: string | null;
  question_version: string | null;
};

function sameStringArray(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

/**
 * Retorna `true` quando qualquer campo relevante do gate mudou entre duas
 * anotações, exigindo invalidação de `evidence_ready` (§11).
 */
export function shouldInvalidateEvidenceReady(
  previous: EvidenceReadyMetadataSnapshot,
  next: EvidenceReadyMetadataSnapshot,
): boolean {
  if (previous.primary_skill_id !== next.primary_skill_id) return true;
  if (previous.difficulty !== next.difficulty) return true;
  if (previous.surface_template_id !== next.surface_template_id) return true;
  if (previous.question_version !== next.question_version) return true;
  if (!sameStringArray(previous.misconception_codes, next.misconception_codes)) return true;
  return false;
}
