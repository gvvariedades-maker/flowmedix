import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildConclusaoIncentivos,
  computeSemanasConsecutivasSimulado,
  type HistoricoEixoDesempenho,
  type PadraoErroHistorico,
  type SimuladoConclusaoIncentivos,
} from '@/lib/simulado/conclusaoMotivacional';
import {
  computeStreaksFromDailyRows,
  type SimuladoAnalyticsDailyRow,
  type SimuladoAnalyticsSessionDimsRow,
} from '@/lib/simulado/analyticsSummary';
import { resolveEixoTematico } from '@/lib/simulado/diagnosticoEixos';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

const META_SEMANAL_SESSOES = 3;
const HISTORICO_DIAS = 90;

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculatePercentual(acertos: number, total: number): number | null {
  if (total <= 0) return null;
  return Number(((acertos / total) * 100).toFixed(0));
}

function aggregateHistoricoEixos(rows: SimuladoAnalyticsSessionDimsRow[]): HistoricoEixoDesempenho[] {
  const map = new Map<string, { acertos: number; total: number }>();

  for (const row of rows) {
    const eixo =
      row.subtopico?.trim() || row.topico?.trim() || 'Outros';
    const acc = map.get(eixo) ?? { acertos: 0, total: 0 };
    acc.total += row.total_questoes ?? 0;
    acc.acertos += row.acertos ?? 0;
    map.set(eixo, acc);
  }

  return Array.from(map.entries()).map(([eixo, stats]) => ({
    eixo,
    acertos: stats.acertos,
    total: stats.total,
    percentual_acerto: calculatePercentual(stats.acertos, stats.total),
  }));
}

function aggregatePadroesErro(rows: SimuladoAnalyticsSessionDimsRow[]): PadraoErroHistorico[] {
  const map = new Map<string, { total: number; erros: number }>();

  for (const row of rows) {
    const eixo =
      row.subtopico?.trim() || row.topico?.trim() || 'Outros';
    const acc = map.get(eixo) ?? { total: 0, erros: 0 };
    acc.total += row.total_questoes ?? 0;
    acc.erros += row.erros ?? 0;
    map.set(eixo, acc);
  }

  return Array.from(map.entries()).map(([eixo, stats]) => ({
    eixo,
    total_questoes: stats.total,
    taxa_erro: calculatePercentual(stats.erros, stats.total),
  }));
}

/** Carrega analytics motivacional para a tela de conclusão do simulado. */
export async function loadConclusaoIncentivos(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  questoes: SimuladoQuestaoItem[],
): Promise<SimuladoConclusaoIncentivos> {
  const historicoStart = new Date();
  historicoStart.setDate(historicoStart.getDate() - HISTORICO_DIAS);
  const queryStartYmd = toYmd(historicoStart);

  const weeklyThreshold = new Date();
  weeklyThreshold.setDate(weeklyThreshold.getDate() - 7);

  const [dimsResult, dailyResult, sessionsResult] = await Promise.all([
    supabase
      .from('simulado_analytics_session_dims')
      .select(
        'session_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms',
      )
      .eq('user_id', userId)
      .neq('session_id', sessionId)
      .gte('data_ref', queryStartYmd)
      .order('data_ref', { ascending: false })
      .limit(5000),
    supabase
      .from('simulado_analytics_daily')
      .select('data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms')
      .eq('user_id', userId)
      .gte('data_ref', queryStartYmd)
      .order('data_ref', { ascending: true })
      .limit(5000),
    supabase
      .from('simulado_sessions')
      .select('id, concluida_em, created_at, status')
      .eq('user_id', userId)
      .eq('status', 'concluido')
      .not('concluida_em', 'is', null)
      .order('concluida_em', { ascending: false })
      .limit(200),
  ]);

  const dimsRows = (dimsResult.data ?? []) as SimuladoAnalyticsSessionDimsRow[];
  const dailyRows = (dailyResult.data ?? []) as SimuladoAnalyticsDailyRow[];
  const sessions = sessionsResult.data ?? [];

  const historicoEixos = aggregateHistoricoEixos(dimsRows);
  const padroesErro = aggregatePadroesErro(dimsRows);

  const streaks = computeStreaksFromDailyRows(dailyRows);
  const weeklySessions = sessions.filter((row) => {
    const baseDate = new Date(row.concluida_em ?? row.created_at);
    return baseDate >= weeklyThreshold;
  }).length;

  const concluidasEm = sessions
    .map((row) => row.concluida_em)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  const semanasConsecutivas = computeSemanasConsecutivasSimulado(concluidasEm);

  const incentivosBase = buildConclusaoIncentivos({
    questoes,
    historicoEixos,
    padroesErro,
    streak_atual_dias: streaks.streak_atual_dias,
    semanas_consecutivas: semanasConsecutivas,
    meta_semanal_atingida: weeklySessions >= META_SEMANAL_SESSOES,
  });

  // Fallback: sem dims materializados, usa eixos da sessão atual apenas para dominios vazios
  if (dimsRows.length === 0 && incentivosBase.dominios.length === 0) {
    const eixosSessao = new Set(
      questoes
        .filter((q) => q.respondida && q.acertou)
        .map((q) => resolveEixoTematico(q.meta)),
    );
    if (eixosSessao.size > 0 && questoes.filter((q) => q.respondida).every((q) => q.acertou)) {
      return {
        ...incentivosBase,
        mensagens_destaque: [
          'Simulado perfeito nesta rodada — mantenha o ritmo!',
          ...incentivosBase.mensagens_destaque,
        ].slice(0, 5),
      };
    }
  }

  return incentivosBase;
}
