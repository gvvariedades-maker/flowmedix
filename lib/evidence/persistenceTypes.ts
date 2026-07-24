/**
 * Contratos de persistência do Evidence Engine (Lote 4 corretivo).
 * Resultados estruturados — adapters não devem lançar para erros esperados de DB.
 */

import type {
  EvidenceAttemptContextPhase1,
  EvidenceConviction,
  EvidenceEventSource,
  EvidenceResponseTimeStatus,
} from '@/lib/evidence/types';

/** Linha persistível — alinhada à migration Lote 2 (timestamps nullable). */
export type EvidenceAttemptEventRow = {
  attempt_id: string;
  user_id: string;
  question_id: string;
  question_version: string;
  selected_alternative: string;
  correct: boolean;
  conviction: EvidenceConviction;
  context: EvidenceAttemptContextPhase1;
  started_at: string | null;
  answered_at: string | null;
  response_time_ms: number | null;
  response_time_status: EvidenceResponseTimeStatus;
  response_time_invalid_reason: string | null;
  answer_change_count: number;
  session_id: string | null;
  source: EvidenceEventSource;
  is_internal: boolean;
  event_type: 'attempt';
  created_at: string;
};

export type EvidenceFindAttemptByIdResult =
  | { ok: true; row: EvidenceAttemptEventRow | null }
  | { ok: false; error: 'persistence_failed' };

/**
 * `race: 'attempt_id'` — violação da partial unique em attempt_id (spec §1.3).
 * `unique_violation_other` — outro 23505; não tratar como replay idempotente.
 */
export type EvidenceInsertAttemptResult =
  | { ok: true; inserted: true }
  | { ok: true; inserted: false; race: 'attempt_id' }
  | { ok: false; error: 'persistence_failed' }
  | { ok: false; error: 'unique_violation_other' };

export type EvidenceEventPersistence = {
  findAttemptById(attempt_id: string): Promise<EvidenceFindAttemptByIdResult>;
  insertAttempt(row: EvidenceAttemptEventRow): Promise<EvidenceInsertAttemptResult>;
};
