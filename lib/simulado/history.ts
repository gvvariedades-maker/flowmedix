import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getAnalyticsPeriodBounds,
  isTimestampInAnalyticsPeriod,
  normalizeSessionMode,
  normalizeSimuladoAnalyticsFilters,
  type SimuladoAnalyticsDimensionFilters,
  type SimuladoAnalyticsMode,
  type SimuladoAnalyticsPeriod,
  type SimuladoSessionAnalyticsRow,
} from '@/lib/simulado/analyticsSummary';

export type SimuladoHistoryStatus = 'todos' | 'aberto' | 'concluido' | 'cancelado';

export type SimuladoHistoryFilters = {
  periodo: SimuladoAnalyticsPeriod;
  modo: SimuladoAnalyticsMode;
  status: SimuladoHistoryStatus;
  page: number;
  pageSize: number;
} & SimuladoAnalyticsDimensionFilters;

export type SimuladoHistoryResult = {
  total: number;
  page: number;
  page_size: number;
  sessions: Array<SimuladoSessionAnalyticsRow & { modo: 'treino' | 'prova' }>;
};

export async function loadSimuladoHistory(
  supabase: SupabaseClient,
  userId: string,
  filters: SimuladoHistoryFilters,
): Promise<SimuladoHistoryResult> {
  const bounds = getAnalyticsPeriodBounds(filters.periodo);
  const periodStartYmd = bounds.queryStartYmd;

  let matchingSessionIds: Set<string> | null = null;
  if (filters.banca || filters.topico || filters.subtopico) {
    let dimsQuery = supabase
      .from('simulado_analytics_session_dims')
      .select('session_id')
      .eq('user_id', userId)
      .gte('data_ref', periodStartYmd)
      .limit(10000);

    if (filters.modo !== 'todos') {
      dimsQuery = dimsQuery.eq('modo', filters.modo);
    }
    if (filters.banca) {
      dimsQuery = dimsQuery.eq('banca', filters.banca);
    }
    if (filters.topico) {
      dimsQuery = dimsQuery.eq('topico', filters.topico);
    }
    if (filters.subtopico) {
      dimsQuery = dimsQuery.eq('subtopico', filters.subtopico);
    }

    const { data: dimsRows, error: dimsError } = await dimsQuery;
    if (dimsError) throw dimsError;
    matchingSessionIds = new Set((dimsRows ?? []).map((row) => row.session_id as string));
    if (matchingSessionIds.size === 0) {
      return {
        total: 0,
        page: filters.page,
        page_size: filters.pageSize,
        sessions: [],
      };
    }
  }

  const { data: rawSessions, error: sessionsError } = await supabase
    .from('simulado_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (sessionsError) throw sessionsError;

  const filtered = ((rawSessions ?? []) as SimuladoSessionAnalyticsRow[])
    .map((row) => ({ ...row, modo: normalizeSessionMode(row) }))
    .filter((row) => {
      if (filters.modo !== 'todos' && row.modo !== filters.modo) return false;
      if (filters.status !== 'todos' && row.status !== filters.status) return false;
      const baseDate = row.concluida_em ?? row.created_at;
      if (!isTimestampInAnalyticsPeriod(baseDate, bounds)) return false;
      if (!matchingSessionIds) return true;
      return matchingSessionIds.has(row.id);
    });

  const total = filtered.length;
  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize;
  const sessions = filtered.slice(start, end);

  return {
    total,
    page: filters.page,
    page_size: filters.pageSize,
    sessions,
  };
}
