import type { SupabaseClient } from '@supabase/supabase-js';
import { computeSemanasConsecutivasSimulado } from '@/lib/simulado/conclusaoMotivacional';
import { getWeeklyFocoPrincipal } from '@/lib/simulado/sessionKind';
import type {
  WeeklyMissionEvolution,
  WeeklySimuladoMission,
} from '@/lib/simulado/types';
import { loadWeeklyMissionEvolution } from '@/lib/simulado/weeklyEvolution';
import {
  getWeeklySimuladoMission,
  isWeeklySimuladoFiltros,
} from '@/lib/simulado/weeklySimulado';
import { getSimuladoSessionDetailForUser } from '@/lib/simulado/sessionDetail';
import { getWeeklyOrdinalFromMap, loadWeeklySessionOrdinals } from '@/lib/simulado/weeklyOrdinal';

export type WeeklyMissionHistoryItem = {
  id: string;
  iso_year: number;
  iso_week: number;
  titulo: string;
  foco_principal: string | null;
  status: 'aberto' | 'concluido' | 'cancelado';
  total_questoes: number;
  percentual_acerto: number | null;
  concluida_em: string | null;
  created_at: string;
  weekly_ordinal: number | null;
};

export type WeeklyMissionHubData = {
  mission: WeeklySimuladoMission;
  history: WeeklyMissionHistoryItem[];
  semanas_consecutivas: number;
  weekly_evolution: WeeklyMissionEvolution | null;
};

type WeeklySessionRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  total_questoes: number;
  titulo: string | null;
  filtros: Record<string, unknown>;
  created_at: string;
  concluida_em: string | null;
  percentual_acerto?: number | null;
};

function mapWeeklyHistoryRow(
  row: WeeklySessionRow,
  ordinals: Map<string, number>,
): WeeklyMissionHistoryItem | null {
  if (!isWeeklySimuladoFiltros(row.filtros)) return null;

  const isoYear = Number(row.filtros.iso_year);
  const isoWeek = Number(row.filtros.iso_week);
  if (!Number.isFinite(isoYear) || !Number.isFinite(isoWeek)) return null;

  return {
    id: row.id,
    iso_year: isoYear,
    iso_week: isoWeek,
    titulo: row.titulo?.trim() || `Simulado da Semana #${isoWeek}`,
    foco_principal: getWeeklyFocoPrincipal(row.filtros),
    status: row.status,
    total_questoes: row.total_questoes,
    percentual_acerto: row.percentual_acerto ?? null,
    concluida_em: row.concluida_em,
    created_at: row.created_at,
    weekly_ordinal: getWeeklyOrdinalFromMap(ordinals, row.id),
  };
}

export async function loadWeeklyMissionHubData(
  supabase: SupabaseClient,
  userId: string,
): Promise<WeeklyMissionHubData | null> {
  const missionResult = await getWeeklySimuladoMission({
    userId,
    autoGenerate: false,
  });

  if (!missionResult) return null;

  const { data: rows, error } = await supabase
    .from('simulado_sessions')
    .select(
      'id, status, total_questoes, titulo, filtros, created_at, concluida_em, percentual_acerto',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) throw error;

  const ordinals = await loadWeeklySessionOrdinals(supabase, userId);

  const history = (rows ?? [])
    .map((row) => mapWeeklyHistoryRow(row as WeeklySessionRow, ordinals))
    .filter((item): item is WeeklyMissionHistoryItem => item !== null)
    .sort((a, b) => {
      if (a.iso_year !== b.iso_year) return b.iso_year - a.iso_year;
      return b.iso_week - a.iso_week;
    });

  const weeklyConcluidasEm = history
    .filter((item) => item.status === 'concluido' && item.concluida_em)
    .map((item) => item.concluida_em as string);

  const semanas_consecutivas = computeSemanasConsecutivasSimulado(weeklyConcluidasEm);

  let weekly_evolution: WeeklyMissionEvolution | null = null;
  const { mission } = missionResult;

  if (
    mission.status === 'concluido' &&
    mission.session_id &&
    mission.percentual_acerto != null
  ) {
    const detail = await getSimuladoSessionDetailForUser(supabase, userId, mission.session_id);
    if (detail.data) {
      weekly_evolution = await loadWeeklyMissionEvolution(
        supabase,
        userId,
        mission.iso_year,
        mission.iso_week,
        detail.data.resumo.percentual_acerto,
        detail.data.questoes,
      );
    }
  }

  return {
    mission,
    history: history.filter((item) => item.id !== mission.session_id),
    semanas_consecutivas,
    weekly_evolution,
  };
}
