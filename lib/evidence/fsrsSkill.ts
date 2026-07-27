/**
 * FSRS-like por `user_id × skill_id` — Fase 5, gated (docs/DECISAO_EVIDENCE_ENGINE.md §12–§13, §25, §27).
 *
 * Gate obrigatório (ADR §12: "FSRS é hipótese posterior, submetida a
 * experimento próprio (RCT-2), não promoção automática após uplift do
 * pacote"; §27 go/no-go RCT-1 é pré-requisito de RCT-2): toda atualização de
 * estado FSRS exige `rct1UpliftConfirmed === true` explicitamente passado
 * pelo caller. Sem confirmação, as funções **lançam** (nunca aplicam update
 * silencioso — mais seguro que no-op para não mascarar wiring indevido).
 *
 * Invariante crítico (§13): T1 (transferência imediata) NUNCA atualiza FSRS.
 * Somente tentativas em `context = scheduled_review`, respondidas ANTES de
 * qualquer explicação nesta sessão, atualizam o agendador.
 *
 * Pure module: sem I/O, sem lib FSRS real (hiperparâmetros ficam para a spec
 * operacional — ADR §29 "decisões adiadas"). Sem wiring em produto.
 */

export class EvidenceEngineGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvidenceEngineGateError';
  }
}

export type FsrsSkillState = {
  /** Estabilidade estimada (dias) — quanto maior, mais espaçada a próxima revisão. */
  stability_days: number;
  /** Dificuldade estimada da competência (escala ilustrativa 1–10; spec decide a final). */
  difficulty: number;
  reps: number;
  lapses: number;
  last_reviewed_at: string | null;
  due_at: string | null;
};

export function createInitialFsrsSkillState(): FsrsSkillState {
  return {
    stability_days: 1,
    difficulty: 5,
    reps: 0,
    lapses: 0,
    last_reviewed_at: null,
    due_at: null,
  };
}

export const FSRS_REVIEW_OUTCOMES = ['again', 'hard', 'good', 'easy'] as const;
export type FsrsReviewOutcome = (typeof FSRS_REVIEW_OUTCOMES)[number];

export type FsrsReviewInput = {
  /** Único contexto elegível a atualizar FSRS (§13). */
  context: 'scheduled_review';
  /** Deve ser `true` — revisão respondida antes de qualquer explicação (§13, §25). */
  reviewed_before_explanation: boolean;
  outcome: FsrsReviewOutcome;
  reviewed_at: string;
};

const OUTCOME_STABILITY_MULTIPLIER: Record<FsrsReviewOutcome, number> = {
  again: 0.5,
  hard: 1.2,
  good: 2.0,
  easy: 3.0,
};

function assertRct1UpliftConfirmed(rct1UpliftConfirmed: boolean): void {
  if (rct1UpliftConfirmed !== true) {
    throw new EvidenceEngineGateError(
      'FSRS update bloqueado: rct1UpliftConfirmed deve ser true (ADR §12, §25, §27 — FSRS só após uplift confirmado do RCT-1).',
    );
  }
}

function assertReviewEligibleForFsrs(input: FsrsReviewInput): void {
  if (input.context !== 'scheduled_review') {
    throw new Error(
      `FSRS update rejeitado: context '${input.context}' inválido — somente 'scheduled_review' atualiza FSRS (ADR §13). T1 (immediate_transfer) NUNCA atualiza FSRS.`,
    );
  }
  if (input.reviewed_before_explanation !== true) {
    throw new Error(
      'FSRS update rejeitado: reviewed_before_explanation deve ser true (ADR §13, §25 — revisão precisa ocorrer antes da explicação).',
    );
  }
}

/**
 * Atualiza o estado FSRS-like. Lança se o gate `rct1UpliftConfirmed` não for
 * `true`, ou se a tentativa não for elegível (context/timing). Simplificado —
 * não é uma implementação FSRS completa (biblioteca e hiperparâmetros ficam
 * na spec operacional, ADR §29).
 */
export function updateFsrsSkillState(
  state: FsrsSkillState,
  input: FsrsReviewInput,
  rct1UpliftConfirmed: boolean,
): FsrsSkillState {
  assertRct1UpliftConfirmed(rct1UpliftConfirmed);
  assertReviewEligibleForFsrs(input);

  const multiplier = OUTCOME_STABILITY_MULTIPLIER[input.outcome];
  const nextStability = Math.max(state.stability_days * multiplier, 0.25);
  const nextDifficulty =
    input.outcome === 'again'
      ? Math.min(state.difficulty + 1, 10)
      : input.outcome === 'easy'
        ? Math.max(state.difficulty - 1, 1)
        : state.difficulty;

  const reviewedAt = new Date(input.reviewed_at);
  const dueAt = new Date(reviewedAt.getTime() + nextStability * 24 * 60 * 60 * 1000);

  return {
    stability_days: nextStability,
    difficulty: nextDifficulty,
    reps: state.reps + 1,
    lapses: state.lapses + (input.outcome === 'again' ? 1 : 0),
    last_reviewed_at: input.reviewed_at,
    due_at: dueAt.toISOString(),
  };
}

/** Próximo intervalo em dias, derivado da estabilidade atual — leitura pura, sem gate (não modifica estado). */
export function computeNextIntervalDays(state: FsrsSkillState): number {
  return Math.round(state.stability_days);
}
