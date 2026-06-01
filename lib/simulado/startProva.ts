import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import {
  resolveSessionMode,
  type SimuladoSessionDbRow,
} from '@/lib/simulado/sessionDetail';

export type StartSimuladoProvaResult =
  | { ok: true; alreadyStarted: boolean; session: SimuladoSessionDbRow }
  | { ok: false; code: 'not_found' | 'invalid_mode' | 'invalid_status' | 'db' };

const SESSION_START_SELECT =
  'id, status, total_questoes, titulo, ritmo_meta_segundos_por_questao, prova_iniciada_em, filtros, created_at, concluida_em';

/** Marca início da prova (idempotente se já iniciada). */
export async function markSimuladoProvaIniciada(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<StartSimuladoProvaResult> {
  const { data: session, error: fetchError } = await supabase
    .from('simulado_sessions')
    .select(SESSION_START_SELECT)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle<SimuladoSessionDbRow>();

  if (fetchError) {
    logger.error('Falha ao buscar sessão para iniciar prova', fetchError, { userId, sessionId });
    return { ok: false, code: 'db' };
  }

  if (!session) {
    return { ok: false, code: 'not_found' };
  }

  if (session.status !== 'aberto') {
    return { ok: false, code: 'invalid_status' };
  }

  if (resolveSessionMode(session.filtros) !== 'prova') {
    return { ok: false, code: 'invalid_mode' };
  }

  if (session.prova_iniciada_em) {
    return { ok: true, alreadyStarted: true, session };
  }

  const startedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from('simulado_sessions')
    .update({ prova_iniciada_em: startedAt })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .eq('status', 'aberto')
    .is('prova_iniciada_em', null)
    .select(SESSION_START_SELECT)
    .maybeSingle<SimuladoSessionDbRow>();

  if (updateError) {
    logger.error('Falha ao iniciar prova do simulado', updateError, { userId, sessionId });
    return { ok: false, code: 'db' };
  }

  if (updated) {
    return { ok: true, alreadyStarted: false, session: updated };
  }

  const { data: refetched, error: refetchError } = await supabase
    .from('simulado_sessions')
    .select(SESSION_START_SELECT)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle<SimuladoSessionDbRow>();

  if (refetchError || !refetched?.prova_iniciada_em) {
    logger.error('Falha ao confirmar início da prova', refetchError, { userId, sessionId });
    return { ok: false, code: 'db' };
  }

  return { ok: true, alreadyStarted: true, session: refetched };
}
