/**
 * Tipos públicos do FSRS MVP (R1.1) — sem expor Card/Rating internos de `ts-fsrs`.
 */

export type FsrsMvpRating = 'again' | 'good';

/** Estados de memória alinhados ao FSRS (string estável para JSON). */
export type FsrsMvpCardLearningState = 'New' | 'Learning' | 'Review' | 'Relearning';

export type FsrsMvpReviewUnitKind = 'cluster' | 'subtopico';

/**
 * Contexto semântico da tentativa (R1).
 * Mapeamento das rotas/sessões do produto → estes valores = **R3**.
 * `isReplay` de historico_questoes **não** é um destes contextos.
 */
export type FsrsAttemptContext =
  | 'cold_practice'
  | 'scheduled_review'
  | 'post_explanation'
  | 'immediate_transfer'
  | 'answer_revealed'
  | 'technical_retry'
  | 'invalid_question'
  | 'unknown';

export const FSRS_ATTEMPT_CONTEXTS = [
  'cold_practice',
  'scheduled_review',
  'post_explanation',
  'immediate_transfer',
  'answer_revealed',
  'technical_retry',
  'invalid_question',
  'unknown',
] as const satisfies readonly FsrsAttemptContext[];

/**
 * Estado em memória do card (camelCase interno do adapter).
 * Persistência usa `FsrsMvpSerializedCard` (versionado).
 */
export interface FsrsMvpCardState {
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: FsrsMvpCardLearningState;
  lastReview: string | null;
}

/**
 * Payload persistível versionado (R1.1) — compatível com Card do ts-fsrs@5.4.1.
 * Sem migration neste lote; formato pronto para R2.
 */
export interface FsrsMvpSerializedCard {
  schemaVersion: 1;
  algorithm: 'ts-fsrs';
  algorithmVersion: '5.4.1';
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: FsrsMvpCardLearningState;
  lastReview: string | null;
}

export interface FsrsMvpConfig {
  /** Retenção desejada (0,1] — default MVP 0,90. */
  requestRetention: number;
  maximumIntervalDays?: number;
  /** Label auditável (ex. ts-fsrs@5.4.1). */
  algorithmVersion: string;
  /** Pin npm exato. */
  packageVersion: '5.4.1';
}

export interface FsrsMvpReviewInput {
  card: FsrsMvpCardState | null;
  rating: FsrsMvpRating;
  reviewedAt: Date;
}

export interface FsrsMvpReviewOutput {
  card: FsrsMvpCardState;
  due: Date;
  scheduledDays: number;
  stateBefore: FsrsMvpCardState | null;
  stateAfter: FsrsMvpCardState;
  rating: FsrsMvpRating;
  algorithmVersion: string;
  serialized: FsrsMvpSerializedCard;
}

export interface FsrsMvpScheduler {
  readonly config: Readonly<FsrsMvpConfig>;
  createInitialCard(now: Date): FsrsMvpCardState;
  review(input: FsrsMvpReviewInput): FsrsMvpReviewOutput;
}

export interface FsrsMvpEligibilityInput {
  context: FsrsAttemptContext | string;
}

export type FsrsMvpIneligibilityReason =
  | 'context_not_eligible'
  | 'context_unknown'
  | 'context_invalid';

export type FsrsMvpEligibilityResult =
  | { eligible: true; context: FsrsAttemptContext }
  | {
      eligible: false;
      reasons: FsrsMvpIneligibilityReason[];
      context: FsrsAttemptContext | null;
    };

/**
 * Resolução de unidade (pura).
 * `knowledgeClusterId` = anotação futura/offline — **não** é coluna do schema atual.
 * Não aceita pedagogical_branch / family / cluster NeuroCanvas.
 */
export interface FsrsMvpResolveReviewUnitInput {
  /** Disciplina canônica (obrigatória). */
  discipline: string;
  /** Subtópico (obrigatório quando cluster não elegível). */
  subtopico?: string | null;
  /** Input futuro opcional — não é campo de banco hoje. */
  knowledgeClusterId?: string | null;
  /**
   * Confirmação **explícita** do caller de que o cluster é válido e tem inventário suficiente.
   * Ausente/false → nunca usa cluster (fallback subtópico).
   */
  clusterInventoryConfirmed?: boolean;
}

export type FsrsMvpResolveReviewUnitResult =
  | {
      ok: true;
      reviewUnitId: string;
      reviewUnitKind: FsrsMvpReviewUnitKind;
    }
  | {
      ok: false;
      reason:
        | 'missing_discipline'
        | 'invalid_discipline'
        | 'missing_subtopico'
        | 'invalid_subtopico'
        | 'generic_subtopico'
        | 'invalid_cluster_id';
    };

/**
 * Entrada para política binária + elegibilidade (sem I/O).
 * `isCorrect` no R3 deve ser derivado no servidor (resolveQuestionAttempt) — R1 não deriva.
 */
export interface FsrsMvpRatingPlanInput {
  context: FsrsAttemptContext | string;
  isCorrect: boolean;
}

export type FsrsMvpRatingPlanResult =
  | { eligible: true; rating: FsrsMvpRating; context: FsrsAttemptContext }
  | {
      eligible: false;
      reasons: FsrsMvpIneligibilityReason[];
      context: FsrsAttemptContext | null;
      rating: null;
    };
