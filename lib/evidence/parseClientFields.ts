/**
 * Parser puro dos campos de cliente do Evidence Engine (Fase 1).
 * Defaults: conviction → unknown; answer_change_count → 0.
 * attempt_id: UUID v4 normativo; ausente ≠ inválido (códigos distintos).
 * Contexts reservados/futuros rejeitados se presentes como emit.
 *
 * Spec: §1.5, §1.7, §4.1–4.3 · plano Lote 1.
 */

import {
  isEvidenceAttemptContextPhase1,
  isEvidenceAttemptContextReserved,
  isEvidenceConviction,
  type EvidenceAttemptClientFields,
  type EvidenceAttemptClientFieldsInput,
  type EvidenceAttemptContextPhase1,
  type EvidenceConviction,
} from '@/lib/evidence/types';

/** UUID v4 (RFC 4122): version nibble = 4; variant = 8|9|a|b */
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ParseClientFieldsErrorCode =
  | 'missing_attempt_id'
  | 'invalid_attempt_id'
  | 'invalid_conviction'
  | 'invalid_answer_change_count'
  | 'invalid_context'
  | 'reserved_context'
  | 'invalid_started_at'
  | 'invalid_answered_at'
  | 'invalid_response_time_ms';

export type ParseClientFieldsError = {
  code: ParseClientFieldsErrorCode;
  message: string;
};

export type ParseClientFieldsOk = {
  ok: true;
  value: EvidenceAttemptClientFields;
  /**
   * Context Phase1 enviado pelo cliente (opcional).
   * Servidor ignora e sobrescreve com derivação da rota (spec §1.7).
   */
  client_context?: EvidenceAttemptContextPhase1;
};

export type ParseClientFieldsErr = {
  ok: false;
  error: ParseClientFieldsError;
};

export type ParseClientFieldsResult = ParseClientFieldsOk | ParseClientFieldsErr;

export function isUuidV4(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_RE.test(value);
}

function fail(code: ParseClientFieldsErrorCode, message: string): ParseClientFieldsErr {
  return { ok: false, error: { code, message } };
}

function parseOptionalIsoTimestamp(
  value: unknown,
  field: 'started_at' | 'answered_at',
): { ok: true; value: string | null } | ParseClientFieldsErr {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (typeof value !== 'string') {
    return fail(
      field === 'started_at' ? 'invalid_started_at' : 'invalid_answered_at',
      `${field} must be a string when present`,
    );
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }
  return { ok: true, value: trimmed };
}

/**
 * Normaliza campos EE do body do cliente.
 * - `conviction` omitida → `unknown`; valor desconhecido → rejeição
 * - `answer_change_count` omitido → `0`; negativo/não-inteiro → rejeição
 * - `attempt_id` ausente → `missing_attempt_id`; presente mas não UUID v4 → `invalid_attempt_id`
 * - `context` Phase1 aceito (ecoado em `client_context`); reserved/futuro → rejeição
 */
export function parseClientFields(
  input: EvidenceAttemptClientFieldsInput | null | undefined,
): ParseClientFieldsResult {
  const raw = input ?? {};

  // --- attempt_id (ausente ≠ inválido) ---
  if (raw.attempt_id === undefined || raw.attempt_id === null) {
    return fail('missing_attempt_id', 'attempt_id is required');
  }
  if (typeof raw.attempt_id !== 'string' || raw.attempt_id.trim().length === 0) {
    return fail('invalid_attempt_id', 'attempt_id must be a non-empty UUID v4 string');
  }
  const attemptId = raw.attempt_id.trim();
  if (!isUuidV4(attemptId)) {
    return fail('invalid_attempt_id', 'attempt_id must be a UUID v4');
  }

  // --- conviction ---
  let conviction: EvidenceConviction;
  if (raw.conviction === undefined || raw.conviction === null) {
    conviction = 'unknown';
  } else if (isEvidenceConviction(raw.conviction)) {
    conviction = raw.conviction;
  } else {
    return fail(
      'invalid_conviction',
      'conviction must be chute | entre_duas | certeza | unknown',
    );
  }

  // --- answer_change_count ---
  let answerChangeCount: number;
  if (raw.answer_change_count === undefined || raw.answer_change_count === null) {
    answerChangeCount = 0;
  } else if (
    typeof raw.answer_change_count === 'number' &&
    Number.isInteger(raw.answer_change_count) &&
    raw.answer_change_count >= 0
  ) {
    answerChangeCount = raw.answer_change_count;
  } else {
    return fail(
      'invalid_answer_change_count',
      'answer_change_count must be a non-negative integer',
    );
  }

  // --- timestamps (opcionais no parser; formato fino fica em responseTime) ---
  const started = parseOptionalIsoTimestamp(raw.started_at, 'started_at');
  if (!started.ok) return started;
  const answered = parseOptionalIsoTimestamp(raw.answered_at, 'answered_at');
  if (!answered.ok) return answered;

  // --- response_time_ms opcional ---
  let responseTimeMs: number | null = null;
  if (raw.response_time_ms !== undefined && raw.response_time_ms !== null) {
    if (
      typeof raw.response_time_ms !== 'number' ||
      !Number.isFinite(raw.response_time_ms) ||
      !Number.isInteger(raw.response_time_ms)
    ) {
      return fail(
        'invalid_response_time_ms',
        'response_time_ms must be a finite integer or null',
      );
    }
    responseTimeMs = raw.response_time_ms;
  }

  // --- context (opcional; reserved/futuro → rejeição; Phase1 aceito) ---
  let clientContext: EvidenceAttemptContextPhase1 | undefined;
  if (raw.context !== undefined && raw.context !== null) {
    if (isEvidenceAttemptContextReserved(raw.context)) {
      return fail(
        'reserved_context',
        `context '${raw.context}' is reserved and not emitível in Phase 1`,
      );
    }
    if (!isEvidenceAttemptContextPhase1(raw.context)) {
      return fail(
        'invalid_context',
        'context must be diagnostic | regular_practice | simulation in Phase 1',
      );
    }
    clientContext = raw.context;
  }

  const value: EvidenceAttemptClientFields = {
    attempt_id: attemptId,
    started_at: started.value,
    answered_at: answered.value,
    conviction,
    answer_change_count: answerChangeCount,
    response_time_ms: responseTimeMs,
  };

  return clientContext !== undefined
    ? { ok: true, value, client_context: clientContext }
    : { ok: true, value };
}
