import { getUserPreferencesOnboarding } from '@/lib/onboarding/preferences';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  isDiagnosticoSessionFiltros,
  SIMULADO_DIAGNOSTICO_TITULO,
} from '@/lib/simulado/diagnosticoConstants';

export type DiagnosticoSimuladoSessionSummary = {
  id: string;
  total_questoes: number;
  status: 'aberto' | 'concluido' | 'cancelado';
  titulo: string;
  created_at: string;
};

export type DiagnosticoSimuladoCardState = {
  show_card: boolean;
  onboarding_completed: boolean;
  diagnostico_completed: boolean;
  has_open_session: boolean;
  session: DiagnosticoSimuladoSessionSummary | null;
};

const SESSION_SELECT = 'id, total_questoes, status, titulo, created_at, filtros';

function mapDiagnosticoSession(row: {
  id: string;
  total_questoes: number;
  status: 'aberto' | 'concluido' | 'cancelado';
  titulo?: string | null;
  created_at: string;
}): DiagnosticoSimuladoSessionSummary {
  return {
    id: row.id,
    total_questoes: row.total_questoes,
    status: row.status,
    titulo: row.titulo?.trim() || SIMULADO_DIAGNOSTICO_TITULO,
    created_at: row.created_at,
  };
}

export async function getDiagnosticoSimuladoCardState(
  userId: string,
): Promise<DiagnosticoSimuladoCardState> {
  const [onboarding, supabase] = await Promise.all([
    getUserPreferencesOnboarding(userId),
    createServerSupabase(),
  ]);

  const { data: sessions, error } = await supabase
    .from('simulado_sessions')
    .select(SESSION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) {
    logger.error('Falha ao buscar sessões para card de diagnóstico', error, { userId });
    throw error;
  }

  const diagnosticoSessions = (sessions ?? []).filter((row) =>
    isDiagnosticoSessionFiltros(row.filtros as Record<string, unknown> | undefined),
  );

  const diagnostico_completed = diagnosticoSessions.some((row) => row.status === 'concluido');
  const openSession = diagnosticoSessions.find((row) => row.status === 'aberto') ?? null;

  const onboarding_completed = onboarding.completed;
  const show_card = onboarding_completed && !diagnostico_completed;

  return {
    show_card,
    onboarding_completed,
    diagnostico_completed,
    has_open_session: openSession != null,
    session: openSession ? mapDiagnosticoSession(openSession) : null,
  };
}
