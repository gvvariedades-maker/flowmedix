/**
 * Adapter Supabase para `evidence_attempt_events` (Lote 4 corretivo — I-3).
 * Server-side; cliente injetado; sem wire em rotas neste lote.
 *
 * Operações: SELECT por attempt_id + INSERT append-only.
 * Proibido: update, delete, upsert, overwrite.
 */

import type {
  EvidenceAttemptEventRow,
  EvidenceEventPersistence,
  EvidenceFindAttemptByIdResult,
  EvidenceInsertAttemptResult,
} from '@/lib/evidence/persistenceTypes';

const TABLE = 'evidence_attempt_events';
const ATTEMPT_ID_RACE_MARKERS = [
  'evidence_attempt_events_attempt_id_attempt_uidx',
  'attempt_id',
] as const;

export type PostgrestErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  constraint?: string;
};

/** Cliente mínimo injetável — testável com fake; produção usa SupabaseClient. */
export type EvidenceSupabaseTableClient = {
  select(columns: string): {
    eq(column: string, value: string): {
      eq(column: string, value: string): {
        maybeSingle(): Promise<{ data: unknown; error: PostgrestErrorLike | null }>;
      };
      maybeSingle(): Promise<{ data: unknown; error: PostgrestErrorLike | null }>;
    };
  };
  insert(row: Record<string, unknown>): Promise<{ error: PostgrestErrorLike | null }>;
};

export type EvidenceSupabaseClientLike = {
  from(table: string): EvidenceSupabaseTableClient;
};

export function isPostgresUniqueViolation(
  error: PostgrestErrorLike | null | undefined,
): boolean {
  if (!error) return false;
  if (error.code === '23505') return true;
  return error.message?.toLowerCase().includes('duplicate') ?? false;
}

/** Identifica corrida na partial unique de attempt_id (não qualquer 23505). */
export function isEvidenceAttemptIdRaceViolation(
  error: PostgrestErrorLike | null | undefined,
): boolean {
  if (!isPostgresUniqueViolation(error)) return false;
  const haystack = [
    error?.constraint,
    error?.details,
    error?.message,
    error?.hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return ATTEMPT_ID_RACE_MARKERS.some((marker) => haystack.includes(marker));
}

function rowFromDbRecord(record: Record<string, unknown>): EvidenceAttemptEventRow | null {
  const attempt_id = record.attempt_id;
  const user_id = record.user_id;
  const question_id = record.question_id;
  const question_version = record.question_version;
  const selected_alternative = record.selected_alternative;
  const correct = record.correct;
  const conviction = record.conviction;
  const context = record.context;
  const response_time_status = record.response_time_status;

  if (
    typeof attempt_id !== 'string' ||
    typeof user_id !== 'string' ||
    typeof question_id !== 'string' ||
    typeof question_version !== 'string' ||
    typeof selected_alternative !== 'string' ||
    typeof correct !== 'boolean' ||
    typeof conviction !== 'string' ||
    typeof context !== 'string' ||
    typeof response_time_status !== 'string'
  ) {
    return null;
  }

  return {
    attempt_id,
    user_id,
    question_id,
    question_version,
    selected_alternative,
    correct,
    conviction: conviction as EvidenceAttemptEventRow['conviction'],
    context: context as EvidenceAttemptEventRow['context'],
    started_at: typeof record.started_at === 'string' ? record.started_at : null,
    answered_at: typeof record.answered_at === 'string' ? record.answered_at : null,
    response_time_ms:
      typeof record.response_time_ms === 'number' ? record.response_time_ms : null,
    response_time_status:
      response_time_status as EvidenceAttemptEventRow['response_time_status'],
    response_time_invalid_reason:
      typeof record.response_time_invalid_reason === 'string'
        ? record.response_time_invalid_reason
        : null,
    answer_change_count:
      typeof record.answer_change_count === 'number' ? record.answer_change_count : 0,
    session_id: typeof record.session_id === 'string' ? record.session_id : null,
    source: record.source as EvidenceAttemptEventRow['source'],
    is_internal: Boolean(record.is_internal),
    event_type: 'attempt',
    created_at:
      typeof record.created_at === 'string'
        ? record.created_at
        : new Date(0).toISOString(),
  };
}

function rowToInsertPayload(row: EvidenceAttemptEventRow): Record<string, unknown> {
  return {
    attempt_id: row.attempt_id,
    user_id: row.user_id,
    question_id: row.question_id,
    question_version: row.question_version,
    selected_alternative: row.selected_alternative,
    correct: row.correct,
    conviction: row.conviction,
    context: row.context,
    started_at: row.started_at,
    answered_at: row.answered_at,
    response_time_ms: row.response_time_ms,
    response_time_status: row.response_time_status,
    response_time_invalid_reason: row.response_time_invalid_reason,
    answer_change_count: row.answer_change_count,
    session_id: row.session_id,
    source: row.source,
    is_internal: row.is_internal,
    event_type: row.event_type,
    created_at: row.created_at,
  };
}

/**
 * Factory do adapter — não executa I/O no import.
 * Lote 5: `createSupabaseEvidencePersistence(await createServerSupabase())`.
 */
export function createSupabaseEvidencePersistence(
  client: EvidenceSupabaseClientLike,
): EvidenceEventPersistence {
  return {
    async findAttemptById(attempt_id: string): Promise<EvidenceFindAttemptByIdResult> {
      const { data, error } = await client
        .from(TABLE)
        .select('*')
        .eq('attempt_id', attempt_id)
        .eq('event_type', 'attempt')
        .maybeSingle();

      if (error) {
        return { ok: false, error: 'persistence_failed' };
      }

      if (!data || typeof data !== 'object') {
        return { ok: true, row: null };
      }

      const row = rowFromDbRecord(data as Record<string, unknown>);
      if (!row) {
        return { ok: false, error: 'persistence_failed' };
      }

      return { ok: true, row };
    },

    async insertAttempt(row: EvidenceAttemptEventRow): Promise<EvidenceInsertAttemptResult> {
      const { error } = await client.from(TABLE).insert(rowToInsertPayload(row));

      if (!error) {
        return { ok: true, inserted: true };
      }

      if (isEvidenceAttemptIdRaceViolation(error)) {
        return { ok: true, inserted: false, race: 'attempt_id' };
      }

      if (isPostgresUniqueViolation(error)) {
        return { ok: false, error: 'unique_violation_other' };
      }

      return { ok: false, error: 'persistence_failed' };
    },
  };
}
