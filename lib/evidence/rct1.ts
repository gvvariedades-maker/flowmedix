/**
 * RCT-1 — pacote completo vs. legado (docs/DECISAO_EVIDENCE_ENGINE.md §18–§22, §27).
 *
 * Randomização determinística por `user_id` (braço) e por `user_id × skill_id`
 * (janela de medição), com holdout versionado por janela (§14, §15, §19).
 *
 * Pure module: SHA-256 sobre strings estruturadas (sem I/O de rede/DB).
 * Nenhum wiring em recommendations.ts, cache, ou rotas — uso apenas em
 * laboratório/testes até a spec operacional da Fase 4 (RCT-1) ser aprovada.
 */

import { createHash } from 'node:crypto';

export const RCT1_ARMS = ['control', 'treatment'] as const;
export type Rct1Arm = (typeof RCT1_ARMS)[number];

export const MEASUREMENT_WINDOWS = ['d7', 'd14', 'd30'] as const;
export type MeasurementWindow = (typeof MEASUREMENT_WINDOWS)[number];

/** Mapeamento 1:1 congelado (§14) — evento persiste o valor curto, nunca o nome de coorte. */
export const MEASUREMENT_WINDOW_COHORTS: Record<MeasurementWindow, string> = {
  d7: 'secondary_d7',
  d14: 'primary_d14',
  d30: 'exploratory_d30',
};

/**
 * Hash determinístico hex (sha256) de uma tupla estruturada com delimitador
 * fixo (§15, §19 — "tupla com delimitador fixo ou HMAC estruturado").
 */
function structuredHash(parts: readonly string[]): string {
  const joined = parts.map((p) => encodeURIComponent(p)).join('\u0000');
  return createHash('sha256').update(joined, 'utf8').digest('hex');
}

/** Converte os 8 primeiros hex chars do hash em um inteiro 0–99 (bucket estável). */
function hashToBucket100(hexDigest: string): number {
  const slice = hexDigest.slice(0, 8);
  const value = parseInt(slice, 16);
  return value % 100;
}

/**
 * `arm_assignment_id = hash(user_id + experiment_id)` (§19).
 * Escopo: por usuário — não inclui `skill_id` (proibido pelo ADR §19).
 */
export function computeArmAssignmentId(userId: string, experimentId: string): string {
  return structuredHash([userId, experimentId]);
}

/**
 * Atribui o braço (`control` | `treatment`) de forma determinística e
 * estável para o mesmo `(userId, experimentId)`. Split 50/50 por padrão
 * (proporção final fica no plano operacional do RCT-1 — §23).
 */
export function assignRct1Arm(
  userId: string,
  experimentId: string,
  treatmentRatioPercent: number = 50,
): { arm: Rct1Arm; arm_assignment_id: string } {
  const arm_assignment_id = computeArmAssignmentId(userId, experimentId);
  const bucket = hashToBucket100(arm_assignment_id);
  const arm: Rct1Arm = bucket < treatmentRatioPercent ? 'treatment' : 'control';
  return { arm, arm_assignment_id };
}

/**
 * `measurement_window_assignment_id = hash(user_id + skill_id + experiment_id)` (§15, §19).
 */
export function computeMeasurementWindowAssignmentId(
  userId: string,
  skillId: string,
  experimentId: string,
): string {
  return structuredHash([userId, skillId, experimentId]);
}

export type MeasurementWindowWeights = Record<MeasurementWindow, number>;

/** Prioridade de amostra/inventário para D+14 (§14 "regras de atribuição congeladas"). */
export const DEFAULT_MEASUREMENT_WINDOW_WEIGHTS: MeasurementWindowWeights = {
  d14: 80,
  d7: 10,
  d30: 10,
};

/**
 * Atribui exatamente uma janela por `(user, skill, experiment)`, determinística
 * e estável. Pesos default priorizam `d14` (§14). Quando `onlyPrimaryD14` é
 * `true`, força `d14` para todos — usar quando amostra/inventário não sustenta
 * coortes separadas (§14: "manter somente D+14").
 */
export function assignMeasurementWindow(
  userId: string,
  skillId: string,
  experimentId: string,
  options?: { weights?: MeasurementWindowWeights; onlyPrimaryD14?: boolean },
): { window: MeasurementWindow; measurement_window_assignment_id: string } {
  const measurement_window_assignment_id = computeMeasurementWindowAssignmentId(
    userId,
    skillId,
    experimentId,
  );

  if (options?.onlyPrimaryD14) {
    return { window: 'd14', measurement_window_assignment_id };
  }

  const weights = options?.weights ?? DEFAULT_MEASUREMENT_WINDOW_WEIGHTS;
  const total = weights.d7 + weights.d14 + weights.d30;
  const bucket = hashToBucket100(measurement_window_assignment_id) % Math.max(total, 1);

  let window: MeasurementWindow;
  if (bucket < weights.d14) {
    window = 'd14';
  } else if (bucket < weights.d14 + weights.d7) {
    window = 'd7';
  } else {
    window = 'd30';
  }

  return { window, measurement_window_assignment_id };
}

/**
 * `holdout_assignment_id = hash(measurement_window_assignment_id + measurement_window + holdout_version)` (§15, §19).
 */
export function computeHoldoutAssignmentId(
  measurementWindowAssignmentId: string,
  window: MeasurementWindow,
  holdoutVersion: string,
): string {
  return structuredHash([measurementWindowAssignmentId, window, holdoutVersion]);
}

/** Exclusão do measurement_pool na vitrine/recomendações legadas (§14, §16). */
export function isQuestionInMeasurementPool(
  questionId: string,
  measurementPoolQuestionIds: ReadonlySet<string>,
): boolean {
  return measurementPoolQuestionIds.has(questionId);
}

/** Filtra fora do measurement_pool (§16 — exclusão comum aos dois braços). */
export function filterOutMeasurementPool<T extends { question_id: string }>(
  items: readonly T[],
  measurementPoolQuestionIds: ReadonlySet<string>,
): T[] {
  return items.filter((item) => !isQuestionInMeasurementPool(item.question_id, measurementPoolQuestionIds));
}

/** Métrica primária pré-registrada (§20, §22). */
export type UpliftInput = {
  controlCorrectCount: number;
  controlTotal: number;
  treatmentCorrectCount: number;
  treatmentTotal: number;
};

export type UpliftResult = {
  controlRate: number;
  treatmentRate: number;
  /** `Uplift_14d = Acerto(tratamento) - Acerto(controle)` na coorte primary_d14 (§22). */
  uplift: number;
};

/**
 * `Uplift_14d = Acerto(tratamento, primary_d14) - Acerto(controle, primary_d14)` (§20, §22).
 * Puramente aritmético — a atribuição de coorte/janela é resolvida pelo caller
 * antes de agregar os totais aqui.
 */
export function computeUplift14d(input: UpliftInput): UpliftResult {
  const controlRate = input.controlTotal === 0 ? 0 : input.controlCorrectCount / input.controlTotal;
  const treatmentRate =
    input.treatmentTotal === 0 ? 0 : input.treatmentCorrectCount / input.treatmentTotal;
  return {
    controlRate,
    treatmentRate,
    uplift: treatmentRate - controlRate,
  };
}
