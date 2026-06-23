import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSessionMode } from '@/lib/simulado/analyticsSummary';
import { loadSimuladoHistory } from '@/lib/simulado/history';
import { resolveSimuladoSessionKind, isAdaptiveSimuladoKind, type SimuladoSessionKind } from '@/lib/simulado/sessionKind';

export type SimuladoHubOpenSession = {
  id: string;
  total_questoes: number;
  modo: 'treino' | 'prova';
  titulo: string;
  created_at: string;
  session_kind: SimuladoSessionKind;
};

export type SimuladoHubSessionItem = {
  id: string;
  status: string;
  modo: 'treino' | 'prova';
  titulo: string;
  total_questoes: number | null;
  percentual_acerto: number | null;
  created_at: string;
  concluida_em: string | null;
  session_kind: SimuladoSessionKind;
};

export type SimuladosHubData = {
  openSession: SimuladoHubOpenSession | null;
  recentSessions: SimuladoHubSessionItem[];
};

type OpenSessionRow = {
  id: string;
  total_questoes: number;
  status: string;
  titulo?: string | null;
  created_at: string;
  filtros?: Record<string, unknown> | null;
};

export async function loadSimuladosHubData(
  supabase: SupabaseClient,
  userId: string,
): Promise<SimuladosHubData> {
  const { data: openRow, error: openError } = await supabase
    .from('simulado_sessions')
    .select('id, total_questoes, status, titulo, created_at, filtros')
    .eq('user_id', userId)
    .eq('status', 'aberto')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<OpenSessionRow>();

  if (openError) {
    throw openError;
  }

  const openSession: SimuladoHubOpenSession | null =
    openRow && !isAdaptiveSimuladoKind(resolveSimuladoSessionKind(openRow.filtros))
      ? {
          id: openRow.id,
          total_questoes: openRow.total_questoes,
          modo: normalizeSessionMode({
            id: openRow.id,
            status: openRow.status,
            filtros: openRow.filtros ?? undefined,
            created_at: openRow.created_at,
          }),
          titulo: openRow.titulo?.trim() ?? '',
          created_at: openRow.created_at,
          session_kind: resolveSimuladoSessionKind(openRow.filtros),
        }
      : null;

  const history = await loadSimuladoHistory(supabase, userId, {
    periodo: '90d',
    modo: 'todos',
    banca: null,
    topico: null,
    subtopico: null,
    status: 'concluido',
    page: 1,
    pageSize: 10,
  });

  const recentSessions: SimuladoHubSessionItem[] = history.sessions
    .filter((row) => row.id !== openSession?.id)
    .filter((row) => !isAdaptiveSimuladoKind(resolveSimuladoSessionKind(row.filtros)))
    .map((row) => ({
      id: row.id,
      status: row.status,
      modo: row.modo,
      titulo: row.titulo?.trim() ?? '',
      total_questoes: row.total_questoes ?? null,
      percentual_acerto: row.percentual_acerto ?? null,
      created_at: row.created_at,
      concluida_em: row.concluida_em ?? null,
      session_kind: resolveSimuladoSessionKind(row.filtros),
    }));

  return { openSession, recentSessions };
}
