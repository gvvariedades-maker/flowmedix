/**
 * RCT-2 — FSRS vs. intervalos fixos (docs/DECISAO_EVIDENCE_ENGINE.md §25 Fase 5, §27).
 *
 * Uplift positivo no RCT-1 **autoriza testar** o FSRS; não comprova que ele
 * supera intervalos fixos (§25). Este módulo só define tipos, randomização
 * (reaproveitando a fórmula de `arm_assignment_id` por usuário, com novo
 * `experiment_id`) e stubs de métrica — nenhuma métrica real é calculada até
 * a spec operacional do RCT-2.
 *
 * Pure module: sem I/O, sem wiring em produto.
 */

import { computeArmAssignmentId } from '@/lib/evidence/rct1';
import { EvidenceEngineGateError } from '@/lib/evidence/fsrsSkill';

export const RCT2_ARMS = ['control_fixed_intervals', 'treatment_fsrs'] as const;
export type Rct2Arm = (typeof RCT2_ARMS)[number];

function hashToBucket100(hexDigest: string): number {
  const value = parseInt(hexDigest.slice(0, 8), 16);
  return value % 100;
}

/**
 * Randomização por usuário, novo `experiment_id` (§25: "Novo experiment_id";
 * "Randomização novamente por usuário"). Reaproveita a mesma fórmula
 * estrutural de `arm_assignment_id` do RCT-1 (`hash(user_id + experiment_id)`),
 * mas com escopo/experimento distintos — nunca reaproveitar o
 * `arm_assignment_id` do RCT-1 diretamente.
 */
export function assignRct2Arm(
  userId: string,
  rct2ExperimentId: string,
  treatmentRatioPercent: number = 50,
): { arm: Rct2Arm; arm_assignment_id: string } {
  const arm_assignment_id = computeArmAssignmentId(userId, rct2ExperimentId);
  const bucket = hashToBucket100(arm_assignment_id);
  const arm: Rct2Arm = bucket < treatmentRatioPercent ? 'treatment_fsrs' : 'control_fixed_intervals';
  return { arm, arm_assignment_id };
}

/**
 * Ambos os braços recebem a mesma experiência de convicção e T1 (§25) — este
 * tipo documenta que a única diferença entre braços é o agendador de
 * revisão, nunca a UI de convicção/T1.
 */
export type Rct2SchedulingPolicy = {
  arm: Rct2Arm;
  /** `control_fixed_intervals` usa EE V1 + intervalos fixos conservadores. */
  uses_fsrs: boolean;
};

export function resolveSchedulingPolicy(arm: Rct2Arm): Rct2SchedulingPolicy {
  return { arm, uses_fsrs: arm === 'treatment_fsrs' };
}

/**
 * Gate espelhado de `fsrsSkill.ts`: qualquer cálculo de métrica de retenção
 * do RCT-2 que dependa de FSRS real só é permitido depois do uplift do
 * RCT-1 confirmado. Lança se o gate não estiver satisfeito.
 */
function assertRct1UpliftConfirmed(rct1UpliftConfirmed: boolean): void {
  if (rct1UpliftConfirmed !== true) {
    throw new EvidenceEngineGateError(
      'RCT-2 bloqueado: rct1UpliftConfirmed deve ser true antes de qualquer métrica FSRS (ADR §25, §27).',
    );
  }
}

/**
 * Métrica recomendada §25: "acerto inédito por minuto estudado". Stub —
 * assinatura e gate definidos; cálculo real é decisão da spec operacional do
 * RCT-2 (nunca comparar engajamento — cliques/tempo/conclusão de slides).
 */
export type RetentionPerMinuteInput = {
  correctUneditedAttempts: number;
  minutesStudied: number;
};

export function computeRetentionPerMinuteStudiedStub(
  input: RetentionPerMinuteInput,
  rct1UpliftConfirmed: boolean,
): number {
  assertRct1UpliftConfirmed(rct1UpliftConfirmed);
  if (input.minutesStudied <= 0) return 0;
  return input.correctUneditedAttempts / input.minutesStudied;
}

/**
 * Métrica recomendada §25: "número de revisões por competência consolidada".
 * Stub aritmético simples — definição final de "consolidada" fica na spec.
 */
export function computeReviewsPerConsolidatedSkillStub(
  totalReviews: number,
  consolidatedSkillCount: number,
  rct1UpliftConfirmed: boolean,
): number {
  assertRct1UpliftConfirmed(rct1UpliftConfirmed);
  if (consolidatedSkillCount <= 0) return 0;
  return totalReviews / consolidatedSkillCount;
}
