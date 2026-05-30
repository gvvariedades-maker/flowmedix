import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export type FinalizeSimuladoSessionResult =
  | { ok: true; alreadyConcluded: boolean }
  | { ok: false; code: 'not_found' | 'db' };

/** Marca sessão como concluída (permite finalizar com questões pendentes). */
export async function markSimuladoSessionConcluida(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<FinalizeSimuladoSessionResult> {
  const { data: session, error: fetchError } = await supabase
    .from('simulado_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle<{ id: string; status: string }>();

  if (fetchError) {
    logger.error('Falha ao buscar sessão para finalizar simulado', fetchError, {
      userId,
      sessionId,
    });
    return { ok: false, code: 'db' };
  }

  if (!session) {
    return { ok: false, code: 'not_found' };
  }

  if (session.status === 'concluido') {
    return { ok: true, alreadyConcluded: true };
  }

  if (session.status !== 'aberto') {
    return { ok: false, code: 'not_found' };
  }

  const { error: updateError } = await supabase
    .from('simulado_sessions')
    .update({
      status: 'concluido',
      concluida_em: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .eq('status', 'aberto');

  if (updateError) {
    logger.error('Falha ao finalizar sessão de simulado', updateError, { userId, sessionId });
    return { ok: false, code: 'db' };
  }

  const { error: refreshError } = await supabase.rpc('refresh_simulado_session_analytics', {
    p_session_id: sessionId,
  });
  if (refreshError) {
    logger.warn('Falha ao materializar analytics da sessão finalizada manualmente', {
      userId,
      sessionId,
      message: refreshError.message,
    });
  }

  return { ok: true, alreadyConcluded: false };
}
