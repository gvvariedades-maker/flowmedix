import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { agruparDesempenhoPorEixo } from '@/lib/simulado/conclusaoMotivacional';
import { getSimuladoSessionDetailForUser } from '@/lib/simulado/sessionDetail';
import type { SimuladoQuestaoItem, WeeklyEixoDelta, WeeklyMissionEvolution } from '@/lib/simulado/types';
import { getIsoWeekInfo, weeklyFiltrosMatchWeek } from '@/lib/simulado/weeklySimuladoCore';

export type { WeeklyEixoDelta, WeeklyMissionEvolution } from '@/lib/simulado/types';

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

export function getPreviousIsoWeek(
  isoYear: number,
  isoWeek: number,
): { isoYear: number; isoWeek: number } {
  if (isoWeek > 1) {
    return { isoYear, isoWeek: isoWeek - 1 };
  }

  const dec28 = new Date(isoYear - 1, 11, 28);
  const lastWeek = getIsoWeekInfo(dec28);
  return { isoYear: lastWeek.isoYear, isoWeek: lastWeek.isoWeek };
}

export async function findPreviousWeeklySession(
  supabase: SupabaseClient,
  userId: string,
  isoYear: number,
  isoWeek: number,
): Promise<WeeklySessionRow | null> {
  const prev = getPreviousIsoWeek(isoYear, isoWeek);

  const { data, error } = await supabase
    .from('simulado_sessions')
    .select(
      'id, status, total_questoes, titulo, filtros, created_at, concluida_em, percentual_acerto',
    )
    .eq('user_id', userId)
    .eq('status', 'concluido')
    .order('concluida_em', { ascending: false })
    .limit(60);

  if (error) {
    logger.warn('Falha ao buscar missão semanal anterior', { userId, code: error.code });
    return null;
  }

  const match = (data ?? []).find((row) =>
    weeklyFiltrosMatchWeek(row.filtros as Record<string, unknown>, prev.isoYear, prev.isoWeek),
  );

  return (match as WeeklySessionRow | undefined) ?? null;
}

function computeEixoDeltas(
  currentQuestoes: SimuladoQuestaoItem[],
  previousQuestoes: SimuladoQuestaoItem[],
  maxItems = 3,
): WeeklyEixoDelta[] {
  const atual = new Map(
    agruparDesempenhoPorEixo(currentQuestoes).map((item) => [item.eixo, item.percentual_acerto]),
  );
  const anterior = new Map(
    agruparDesempenhoPorEixo(previousQuestoes).map((item) => [item.eixo, item.percentual_acerto]),
  );

  const deltas: WeeklyEixoDelta[] = [];

  for (const [eixo, pctAtual] of atual) {
    const pctAnterior = anterior.get(eixo);
    if (pctAtual === null || pctAnterior === null || pctAnterior === undefined) continue;
    const delta = pctAtual - pctAnterior;
    if (delta === 0) continue;

    deltas.push({
      eixo,
      percentual_anterior: pctAnterior,
      percentual_atual: pctAtual,
      delta_pontos: delta,
      direction: delta > 0 ? 'up' : 'down',
    });
  }

  return deltas
    .sort((a, b) => Math.abs(b.delta_pontos) - Math.abs(a.delta_pontos))
    .slice(0, maxItems);
}

export function buildWeeklyMissionEvolution(params: {
  isoWeekAtual: number;
  isoWeekAnterior: number | null;
  percentualAtual: number;
  percentualAnterior: number | null;
  currentQuestoes: SimuladoQuestaoItem[];
  previousQuestoes: SimuladoQuestaoItem[];
  hasPrevious: boolean;
}): WeeklyMissionEvolution {
  const {
    isoWeekAtual,
    isoWeekAnterior,
    percentualAtual,
    percentualAnterior,
    currentQuestoes,
    previousQuestoes,
    hasPrevious,
  } = params;

  if (!hasPrevious) {
    return {
      has_previous: false,
      iso_week_anterior: null,
      iso_week_atual: isoWeekAtual,
      percentual_anterior: null,
      percentual_atual: percentualAtual,
      delta_global: null,
      eixos_destaque: [],
      mensagem_vazia: 'Primeira missão — na próxima semana você verá sua evolução',
    };
  }

  const deltaGlobal =
    percentualAnterior !== null ? percentualAtual - percentualAnterior : null;

  return {
    has_previous: true,
    iso_week_anterior: isoWeekAnterior,
    iso_week_atual: isoWeekAtual,
    percentual_anterior: percentualAnterior,
    percentual_atual: percentualAtual,
    delta_global: deltaGlobal,
    eixos_destaque: computeEixoDeltas(currentQuestoes, previousQuestoes),
    mensagem_vazia: null,
  };
}

export async function loadWeeklyMissionEvolution(
  supabase: SupabaseClient,
  userId: string,
  isoYear: number,
  isoWeek: number,
  percentualAtual: number,
  currentQuestoes: SimuladoQuestaoItem[],
): Promise<WeeklyMissionEvolution> {
  const previous = await findPreviousWeeklySession(supabase, userId, isoYear, isoWeek);
  const prevWeek = getPreviousIsoWeek(isoYear, isoWeek);

  if (!previous) {
    return buildWeeklyMissionEvolution({
      isoWeekAtual: isoWeek,
      isoWeekAnterior: null,
      percentualAtual,
      percentualAnterior: null,
      currentQuestoes,
      previousQuestoes: [],
      hasPrevious: false,
    });
  }

  let previousQuestoes: SimuladoQuestaoItem[] = [];
  let percentualAnterior = previous.percentual_acerto ?? null;

  const prevDetail = await getSimuladoSessionDetailForUser(supabase, userId, previous.id);
  if (prevDetail.data) {
    previousQuestoes = prevDetail.data.questoes;
    if (percentualAnterior === null) {
      percentualAnterior = prevDetail.data.resumo.percentual_acerto;
    }
  }

  return buildWeeklyMissionEvolution({
    isoWeekAtual: isoWeek,
    isoWeekAnterior: prevWeek.isoWeek,
    percentualAtual,
    percentualAnterior,
    currentQuestoes,
    previousQuestoes,
    hasPrevious: true,
  });
}
