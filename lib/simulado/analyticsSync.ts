import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Materializa analytics para sessões concluídas que ainda não têm agregados
 * (ex.: migration aplicada depois, ou trigger não executou).
 */
export async function syncPendingSimuladoAnalytics(
  serviceSupabase: SupabaseClient,
  userId: string,
  maxSessions = 40,
): Promise<void> {
  const { data: completed, error: sessionsError } = await serviceSupabase
    .from('simulado_sessions')
    .select('id, acertos')
    .eq('user_id', userId)
    .eq('status', 'concluido')
    .not('concluida_em', 'is', null)
    .order('concluida_em', { ascending: false })
    .limit(200);

  if (sessionsError) {
    logger.warn('syncPendingSimuladoAnalytics: falha ao listar sessões', {
      userId,
      message: sessionsError.message,
    });
    return;
  }

  if (!completed?.length) return;

  const sessionIds = completed.map((row) => row.id);
  const { data: dimsRows, error: dimsError } = await serviceSupabase
    .from('simulado_analytics_session_dims')
    .select('session_id')
    .eq('user_id', userId)
    .in('session_id', sessionIds);

  if (dimsError) {
    if (dimsError.code === '42P01' || dimsError.message.includes('does not exist')) {
      return;
    }
    logger.warn('syncPendingSimuladoAnalytics: falha ao listar dims', {
      userId,
      message: dimsError.message,
    });
    return;
  }

  const withDims = new Set((dimsRows ?? []).map((row) => row.session_id));
  const pending = completed
    .filter((row) => !withDims.has(row.id) || row.acertos === null)
    .map((row) => row.id)
    .slice(0, maxSessions);

  for (const sessionId of pending) {
    const { error } = await serviceSupabase.rpc('refresh_simulado_session_analytics', {
      p_session_id: sessionId,
    });
    if (error) {
      if (error.code === '42883' || error.message.includes('does not exist')) {
        return;
      }
      logger.warn('refresh_simulado_session_analytics falhou', {
        userId,
        sessionId,
        message: error.message,
      });
    }
  }
}
