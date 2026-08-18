/**
 * Contratos puros do Evidence Engine — Fase 1 (event stream).
 * Âncoras: docs/SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md §1.2–1.8, §4.1;
 * docs/DECISAO_EVIDENCE_ENGINE.md §8; plano Lote 1.
 *
 * Sem I/O, env, rotas ou player.
 */

/** Wire format ADR §8 / spec §4.1 — UI: Chutei / Entre duas / Tenho certeza */
export const EVIDENCE_CONVICTIONS = ['chute', 'entre_duas', 'certeza', 'unknown'] as const;
export type EvidenceConviction = (typeof EVIDENCE_CONVICTIONS)[number];

/** Contextos canônicos ADR §8 (completo) */
export const EVIDENCE_ATTEMPT_CONTEXTS = [
  'diagnostic',
  'regular_practice',
  'pre_explanation',
  'immediate_transfer',
  'scheduled_review',
  'simulation',
  'measurement_holdout',
] as const;
export type EvidenceAttemptContext = (typeof EVIDENCE_ATTEMPT_CONTEXTS)[number];

/** Contextos emitíveis/persistíveis na Fase 1 (spec §1.7) */
export const EVIDENCE_ATTEMPT_CONTEXTS_PHASE1 = [
  'diagnostic',
  'regular_practice',
  'simulation',
] as const;
export type EvidenceAttemptContextPhase1 = (typeof EVIDENCE_ATTEMPT_CONTEXTS_PHASE1)[number];

/** Reservados — não emitidos na Fase 1; parser rejeita se pretendidos como emit */
export const EVIDENCE_ATTEMPT_CONTEXTS_RESERVED = [
  'pre_explanation',
  'immediate_transfer',
  'scheduled_review',
  'measurement_holdout',
] as const;
export type EvidenceAttemptContextReserved = (typeof EVIDENCE_ATTEMPT_CONTEXTS_RESERVED)[number];

export const EVIDENCE_RESPONSE_TIME_STATUSES = ['valid', 'invalid', 'unknown'] as const;
export type EvidenceResponseTimeStatus = (typeof EVIDENCE_RESPONSE_TIME_STATUSES)[number];

/** Reasons de spec §1.6 (lista aberta no wire; union tipada para o núcleo puro) */
export const EVIDENCE_RESPONSE_TIME_INVALID_REASONS = [
  'negative_delta',
  'exceeds_plausible_max',
  'clock_skew',
  'missing_started_at',
  'tab_backgrounded',
  'page_reload',
  'non_finite_delta',
] as const;
export type EvidenceResponseTimeInvalidReason =
  (typeof EVIDENCE_RESPONSE_TIME_INVALID_REASONS)[number];

/** Discriminante — Fase 1 só produz `attempt` */
export const EVIDENCE_EVENT_TYPES = ['attempt', 'transfer_inventory_missing'] as const;
export type EvidenceEventType = (typeof EVIDENCE_EVENT_TYPES)[number];

/** `source` derivado no servidor (spec §4.3) */
export const EVIDENCE_EVENT_SOURCES = [
  'api_registrar_tentativa',
  'api_simulado_responder',
  'reconcile_backfill',
] as const;
export type EvidenceEventSource = (typeof EVIDENCE_EVENT_SOURCES)[number];

/**
 * Classificação pura de idempotência (spec §1.3.1) — sem DB, sem overwrite.
 * `novo` | `duplicado_equivalente` | `conflito`
 */
export const EVIDENCE_IDEMPOTENCY_CLASSIFICATIONS = [
  'novo',
  'duplicado_equivalente',
  'conflito',
] as const;
export type EvidenceIdempotencyClassification =
  (typeof EVIDENCE_IDEMPOTENCY_CLASSIFICATIONS)[number];

/**
 * Campos do fingerprint semântico §1.3.1 (comparados em retry).
 * Fora do fingerprint: started_at, answered_at, response_time_*, session_id,
 * source, created_at, is_internal.
 */
export type EvidenceSemanticFingerprintFields = {
  selected_alternative: string;
  correct: boolean;
  question_version: string;
  context: EvidenceAttemptContextPhase1;
  conviction: EvidenceConviction;
  answer_change_count: number;
  question_id: string;
  user_id: string;
};

/**
 * Campos enviados pelo cliente no body estendido (spec §4.1).
 * NÃO inclui context, user_id, correct, question_version, event_type, is_internal.
 */
export type EvidenceAttemptClientFields = {
  attempt_id: string;
  started_at: string | null;
  answered_at: string | null;
  conviction: EvidenceConviction;
  answer_change_count: number;
  /** Opcional — se omitido, servidor deriva response_time_* */
  response_time_ms: number | null;
};

/** Input bruto (body / unknown) — parser aplica defaults e rejeições */
export type EvidenceAttemptClientFieldsInput = {
  attempt_id?: unknown;
  started_at?: unknown;
  answered_at?: unknown;
  conviction?: unknown;
  answer_change_count?: unknown;
  response_time_ms?: unknown;
  /**
   * Não faz parte do contrato de cliente persistido; se presente, deve ser
   * Phase1 (aceito e ignorado na ingestão) ou reserved/inválido (rejeitado).
   */
  context?: unknown;
  /**
   * Sinal de visibility (Lote 7). Não entra no fingerprint nem em
   * `parseClientFields`; o hook de rota encaminha a `ingestAttemptEvent`.
   */
  tab_backgrounded?: unknown;
};

/** Evento canônico persistido (servidor) — Fase 1: event_type sempre `attempt` */
export type EvidenceAttemptEvent = {
  event_type: 'attempt';
  attempt_id: string;
  user_id: string;
  question_id: string;
  question_version: string;
  selected_alternative: string;
  correct: boolean;
  conviction: EvidenceConviction;
  context: EvidenceAttemptContextPhase1;
  started_at: string;
  answered_at: string;
  response_time_ms: number | null;
  response_time_status: EvidenceResponseTimeStatus;
  response_time_invalid_reason: string | null;
  answer_change_count: number;
  session_id: string | null;
  source: EvidenceEventSource;
  is_internal: boolean;
  created_at: string;
};

/** Campos derivados exclusivamente no servidor (nunca confiáveis do body) */
export type EvidenceServerDerivedFields = {
  user_id: string;
  correct: boolean;
  question_version: string;
  context: EvidenceAttemptContextPhase1;
  event_type: 'attempt';
  is_internal: boolean;
  source: EvidenceEventSource;
  created_at: string;
  question_id: string;
  selected_alternative: string;
};

export function isEvidenceConviction(value: unknown): value is EvidenceConviction {
  return (
    typeof value === 'string' &&
    (EVIDENCE_CONVICTIONS as readonly string[]).includes(value)
  );
}

export function isEvidenceAttemptContext(value: unknown): value is EvidenceAttemptContext {
  return (
    typeof value === 'string' &&
    (EVIDENCE_ATTEMPT_CONTEXTS as readonly string[]).includes(value)
  );
}

export function isEvidenceAttemptContextPhase1(
  value: unknown,
): value is EvidenceAttemptContextPhase1 {
  return (
    typeof value === 'string' &&
    (EVIDENCE_ATTEMPT_CONTEXTS_PHASE1 as readonly string[]).includes(value)
  );
}

export function isEvidenceAttemptContextReserved(
  value: unknown,
): value is EvidenceAttemptContextReserved {
  return (
    typeof value === 'string' &&
    (EVIDENCE_ATTEMPT_CONTEXTS_RESERVED as readonly string[]).includes(value)
  );
}

export function isEvidenceEventSource(value: unknown): value is EvidenceEventSource {
  return (
    typeof value === 'string' &&
    (EVIDENCE_EVENT_SOURCES as readonly string[]).includes(value)
  );
}
