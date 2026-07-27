/**
 * Hook compartilhado de ingestão EE pós-sucesso legado (Lotes 5–6).
 * Boundary não bloqueante; flag off não inicializa adapter.
 */

import { isEvidenceV1InstrumentationEnabled } from '@/lib/env';
import type { EvidenceSimuladoSessionKindStub } from '@/lib/evidence/deriveContext';
import {
  ingestAttemptEvent,
  type IngestAttemptEventResult,
} from '@/lib/evidence/ingestAttemptEvent';
import {
  createSupabaseEvidencePersistence,
  type EvidenceSupabaseClientLike,
} from '@/lib/evidence/supabasePersistence';
import type { EvidenceAttemptClientFieldsInput } from '@/lib/evidence/types';
import type { EvidenceIngestRoute } from '@/lib/evidence/deriveContext';
import { logger } from '@/lib/logger';

export type EvidenceHttpHint =
  | { attempt_id: string; created: boolean }
  | { skipped: true; reason: string };

export function extractEvidenceClientBody(
  body: Record<string, unknown>,
): EvidenceAttemptClientFieldsInput {
  const client: EvidenceAttemptClientFieldsInput = {};
  if ('attempt_id' in body) client.attempt_id = body.attempt_id;
  if ('started_at' in body) client.started_at = body.started_at;
  if ('answered_at' in body) client.answered_at = body.answered_at;
  if ('conviction' in body) client.conviction = body.conviction;
  if ('answer_change_count' in body) client.answer_change_count = body.answer_change_count;
  if ('response_time_ms' in body) client.response_time_ms = body.response_time_ms;
  if ('context' in body) client.context = body.context;
  if ('tab_backgrounded' in body) client.tab_backgrounded = body.tab_backgrounded;
  return client;
}

export function buildEvidenceHttpHint(
  result: IngestAttemptEventResult,
): EvidenceHttpHint | undefined {
  switch (result.status) {
    case 'disabled':
      return undefined;
    case 'created':
      return { attempt_id: result.attempt_id, created: true };
    case 'duplicate':
      return { attempt_id: result.attempt_id, created: false };
    case 'conflict':
      return { skipped: true, reason: 'conflict' };
    case 'skipped':
      if (result.reason === 'missing_attempt_id') {
        return undefined;
      }
      return { skipped: true, reason: result.reason };
    case 'persistence_failed':
      return { skipped: true, reason: 'persistence_failed' };
    default:
      return undefined;
  }
}

export type IngestEvidenceRouteHookInput = {
  supabase: EvidenceSupabaseClientLike;
  route: EvidenceIngestRoute;
  user_id: string;
  user_email?: string | null;
  question_id: string;
  selected_alternative: string;
  correct: boolean;
  conteudo_json: unknown;
  client_body: EvidenceAttemptClientFieldsInput;
  session_id?: string | null;
  session_kind?: EvidenceSimuladoSessionKindStub | null;
  e2e_instrumentation?: boolean;
  /** Rótulo curto para logs (ex.: registrar-tentativa, simulado-responder). */
  log_route_label: string;
};

/**
 * Ingere evento EE após persistência legado bem-sucedida.
 * Nunca lança para a rota HTTP — falhas viram hint skipped ou omitido.
 */
export async function ingestEvidenceRouteHook(
  input: IngestEvidenceRouteHookInput,
): Promise<EvidenceHttpHint | undefined> {
  if (!isEvidenceV1InstrumentationEnabled()) {
    return undefined;
  }

  try {
    const persistence = createSupabaseEvidencePersistence(input.supabase);
    const result = await ingestAttemptEvent({
      route: input.route,
      user_id: input.user_id,
      user_email: input.user_email,
      question_id: input.question_id,
      selected_alternative: input.selected_alternative,
      correct: input.correct,
      conteudo_json: input.conteudo_json,
      client_body: input.client_body,
      session_id: input.session_id ?? null,
      session_kind: input.session_kind ?? null,
      e2e_instrumentation: input.e2e_instrumentation ?? false,
      now_ms: Date.now(),
      persistence,
    });
    return buildEvidenceHttpHint(result);
  } catch (error) {
    logger.error(`Evidence ingest boundary failed in ${input.log_route_label}`, error, {
      userId: input.user_id,
      question_id: input.question_id,
      session_id: input.session_id ?? undefined,
    });
    return { skipped: true, reason: 'persistence_failed' };
  }
}
