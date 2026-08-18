/**
 * Seletor determinístico de transferência T1 — Fase 3 (docs/DECISAO_EVIDENCE_ENGINE.md §11, §16).
 *
 * A Fase 3 **não** anota em runtime: o seletor aceita somente candidatas já
 * anotadas na Fase 2, revisadas por humano, versionadas, aprovadas no gate
 * `evidence_ready` (§11). Nenhuma inferência de metadado ocorre aqui.
 *
 * Exclusões obrigatórias (§16, subconjunto Fase 3 + pleno pós-Fase 2):
 * - `measurement_pool` do aluno para aquele (skill, experiment);
 * - já vista pelo aluno (mesma questão);
 * - mesmo `surface_template_id` da questão-mãe;
 * - `question_version` incompatível (não é a versão vigente esperada);
 * - `evidence_ready !== true`;
 * - a própria questão-mãe.
 *
 * Sem candidata válida → `{ missing: true }`, mapeável ao contrato canônico
 * `transfer_inventory_missing` (§8). Este módulo só produz o *shape* do
 * evento — não emite nada em runtime (proibido nesta fase).
 *
 * Pure module: sem I/O, sem wiring em recommendations.ts / vitrine.
 */

export type TransferCandidateQuestion = {
  question_id: string;
  question_version: string;
  primary_skill_id: string;
  surface_template_id: string;
  difficulty: number;
  evidence_ready: boolean;
  /** Misconception(s) associada(s) à candidata, se houver. */
  misconception_codes: readonly string[];
  /** Número de exposições prévias do aluno a esta questão específica (0 se nunca). */
  exposure_count: number;
};

export type TransferSelectorMotherContext = {
  mother_question_id: string;
  primary_skill_id: string;
  surface_template_id: string;
  difficulty: number;
  /** Versão vigente esperada para candidatas (§9 — question_version válida). */
  expected_question_version: string;
  /** Misconception(s) diagnosticada(s) na tentativa da questão-mãe, se houver. */
  detected_misconception_codes: readonly string[];
};

export type SelectTransferCandidateInput = {
  mother: TransferSelectorMotherContext;
  /** IDs de questões já vistas pelo aluno em qualquer superfície. */
  seen_question_ids: ReadonlySet<string>;
  /** `measurement_pool(user, skill, experiment)` — inelegível em toda superfície (§14). */
  measurement_pool_question_ids: ReadonlySet<string>;
  /** Entitlement já resolvido pelo caller (fora do escopo deste seletor puro). */
  entitlement_allowed_question_ids: ReadonlySet<string> | null;
  candidates: readonly TransferCandidateQuestion[];
};

export const TRANSFER_EXCLUSION_REASONS = [
  'is_mother_question',
  'already_seen',
  'in_measurement_pool',
  'same_surface_template',
  'incompatible_question_version',
  'not_evidence_ready',
  'different_skill',
  'entitlement_not_allowed',
] as const;
export type TransferExclusionReason = (typeof TRANSFER_EXCLUSION_REASONS)[number];

export type TransferCandidateEvaluation = {
  candidate: TransferCandidateQuestion;
  excluded: boolean;
  exclusion_reasons: TransferExclusionReason[];
};

/** Avalia uma única candidata contra todas as exclusões obrigatórias (§11, §16). */
export function evaluateTransferCandidate(
  mother: TransferSelectorMotherContext,
  candidate: TransferCandidateQuestion,
  seenQuestionIds: ReadonlySet<string>,
  measurementPoolQuestionIds: ReadonlySet<string>,
  entitlementAllowedQuestionIds: ReadonlySet<string> | null,
): TransferCandidateEvaluation {
  const reasons: TransferExclusionReason[] = [];

  if (candidate.question_id === mother.mother_question_id) {
    reasons.push('is_mother_question');
  }
  if (seenQuestionIds.has(candidate.question_id)) {
    reasons.push('already_seen');
  }
  if (measurementPoolQuestionIds.has(candidate.question_id)) {
    reasons.push('in_measurement_pool');
  }
  if (candidate.surface_template_id === mother.surface_template_id) {
    reasons.push('same_surface_template');
  }
  if (candidate.question_version !== mother.expected_question_version) {
    reasons.push('incompatible_question_version');
  }
  if (!candidate.evidence_ready) {
    reasons.push('not_evidence_ready');
  }
  if (candidate.primary_skill_id !== mother.primary_skill_id) {
    reasons.push('different_skill');
  }
  if (
    entitlementAllowedQuestionIds !== null &&
    !entitlementAllowedQuestionIds.has(candidate.question_id)
  ) {
    reasons.push('entitlement_not_allowed');
  }

  return { candidate, excluded: reasons.length > 0, exclusion_reasons: reasons };
}

function countMisconceptionOverlap(
  candidate: TransferCandidateQuestion,
  detected: readonly string[],
): number {
  if (detected.length === 0) return 0;
  const detectedSet = new Set(detected);
  return candidate.misconception_codes.filter((code) => detectedSet.has(code)).length;
}

/**
 * Ordenação determinística (§11, ilustrativa — pesos finais na spec):
 * 1. Distrator ligado à misconception detectada (desc)
 * 2. Maior diferença superficial — aproximada por `surface_template_id` distinto
 *    (já garantido pela exclusão; usamos comprimento do id como proxy estável)
 * 3. Menor número de exposições (asc)
 * 4. Dificuldade mais próxima da questão-mãe (asc)
 * 5. Empate final: `question_id` lexicográfico (determinístico; sem
 *    aleatoriedade em runtime desta fase — "aleatoriedade controlada" fica
 *    para a spec operacional).
 */
function compareCandidates(
  mother: TransferSelectorMotherContext,
  a: TransferCandidateQuestion,
  b: TransferCandidateQuestion,
): number {
  const misconceptionA = countMisconceptionOverlap(a, mother.detected_misconception_codes);
  const misconceptionB = countMisconceptionOverlap(b, mother.detected_misconception_codes);
  if (misconceptionA !== misconceptionB) return misconceptionB - misconceptionA;

  if (a.exposure_count !== b.exposure_count) return a.exposure_count - b.exposure_count;

  const difficultyDiffA = Math.abs(a.difficulty - mother.difficulty);
  const difficultyDiffB = Math.abs(b.difficulty - mother.difficulty);
  if (difficultyDiffA !== difficultyDiffB) return difficultyDiffA - difficultyDiffB;

  return a.question_id < b.question_id ? -1 : a.question_id > b.question_id ? 1 : 0;
}

export type SelectTransferCandidateResult =
  | { missing: false; candidate: TransferCandidateQuestion }
  | { missing: true; evaluations: TransferCandidateEvaluation[] };

/** Seleciona a melhor candidata elegível, ou reporta ausência de inventário. */
export function selectTransferCandidate(
  input: SelectTransferCandidateInput,
): SelectTransferCandidateResult {
  const evaluations = input.candidates.map((candidate) =>
    evaluateTransferCandidate(
      input.mother,
      candidate,
      input.seen_question_ids,
      input.measurement_pool_question_ids,
      input.entitlement_allowed_question_ids,
    ),
  );

  const eligible = evaluations
    .filter((evaluation) => !evaluation.excluded)
    .map((evaluation) => evaluation.candidate)
    .sort((a, b) => compareCandidates(input.mother, a, b));

  if (eligible.length === 0) {
    return { missing: true, evaluations };
  }
  return { missing: false, candidate: eligible[0] };
}

/**
 * Shape do evento canônico `transfer_inventory_missing` (§8) — apenas tipos
 * e mapeamento puro. Nenhum emit real ocorre nesta fase (proibido em runtime
 * até a spec operacional decidir o pipeline de ingestão desse event_type).
 */
export type TransferInventoryMissingEventShape = {
  event_type: 'transfer_inventory_missing';
  attempt_id: null;
  context: 'immediate_transfer';
  user_id: string;
  question_id: string;
  primary_skill_id: string | null;
  session_id: string;
};

export function mapMissingToTransferInventoryMissingEvent(input: {
  user_id: string;
  mother_question_id: string;
  primary_skill_id: string | null;
  session_id: string;
}): TransferInventoryMissingEventShape {
  return {
    event_type: 'transfer_inventory_missing',
    attempt_id: null,
    context: 'immediate_transfer',
    user_id: input.user_id,
    question_id: input.mother_question_id,
    primary_skill_id: input.primary_skill_id,
    session_id: input.session_id,
  };
}
