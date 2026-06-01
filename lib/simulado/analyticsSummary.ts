import type { SupabaseClient } from '@supabase/supabase-js';
import { getFreemiumDayBounds } from '@/lib/freemium';

export const SIMULADO_ANALYTICS_PERIODS = ['1d', '7d', '30d', '90d', '12m'] as const;
export const SIMULADO_ANALYTICS_MODES = ['todos', 'treino', 'prova'] as const;

export type SimuladoAnalyticsPeriod = (typeof SIMULADO_ANALYTICS_PERIODS)[number];
export type SimuladoAnalyticsMode = (typeof SIMULADO_ANALYTICS_MODES)[number];

export type SimuladoSessionAnalyticsRow = {
  id: string;
  status: string;
  titulo?: string | null;
  modo?: string | null;
  filtros?: Record<string, unknown> | null;
  total_questoes?: number | null;
  acertos?: number | null;
  erros?: number | null;
  percentual_acerto?: number | null;
  tempo_total_ms?: number | null;
  tempo_medio_ms?: number | null;
  concluida_em?: string | null;
  created_at: string;
};

export type SimuladoAnalyticsDailyRow = {
  data_ref: string;
  modo: 'treino' | 'prova';
  banca: string;
  topico: string;
  subtopico: string;
  total_questoes: number;
  acertos: number;
  erros: number;
  tempo_total_ms: number;
};

export type SimuladoAnalyticsSessionDimsRow = {
  session_id: string;
  data_ref: string;
  modo: 'treino' | 'prova';
  banca: string;
  topico: string;
  subtopico: string;
  total_questoes: number;
  acertos: number;
  erros: number;
  tempo_total_ms: number;
};

export type SimuladoAnalyticsDimensionFilters = {
  banca: string | null;
  topico: string | null;
  subtopico: string | null;
};

export type SimuladoAnalyticsFilters = {
  periodo: SimuladoAnalyticsPeriod;
  modo: SimuladoAnalyticsMode;
} & SimuladoAnalyticsDimensionFilters;

export type SimuladoEvolucaoItem = {
  data_ref: string;
  total_questoes: number;
  acertos: number;
  erros: number;
  percentual_acerto: number | null;
  tempo_total_ms: number;
  tempo_medio_ms: number | null;
};

export type SimuladoDimensionMetric = {
  nome: string;
  total_questoes: number;
  acertos: number;
  erros: number;
  percentual_acerto: number | null;
};

export type SimuladoErrorPattern = {
  banca: string;
  topico: string;
  subtopico: string;
  total_questoes: number;
  erros: number;
  taxa_erro: number | null;
};

export type SimuladoStreakMetrics = {
  dias_ativos_periodo: number;
  streak_atual_dias: number;
  melhor_streak_dias: number;
};

export type SimuladoGoalsMetrics = {
  meta_semanal_sessoes: number;
  sessoes_ultimos_7d: number;
  progresso_meta_semanal: number;
  meta_mensal_questoes: number;
  questoes_ultimos_30d: number;
  progresso_meta_mensal: number;
};

export type SimuladoAnalyticsSummary = {
  sessions: Array<SimuladoSessionAnalyticsRow & { modo: 'treino' | 'prova' }>;
  completedSessions: Array<SimuladoSessionAnalyticsRow & { modo: 'treino' | 'prova' }>;
  totalSimulados: number;
  mediaAcerto: number | null;
  melhorScore: number | null;
  tempoMedioMs: number | null;
  ultimasSessoes: Array<SimuladoSessionAnalyticsRow & { modo: 'treino' | 'prova' }>;
  evolucaoTemporal: SimuladoEvolucaoItem[];
  desempenhoPorBanca: SimuladoDimensionMetric[];
  desempenhoPorTopico: SimuladoDimensionMetric[];
  desempenhoPorSubtopico: SimuladoDimensionMetric[];
  errorPatterns: SimuladoErrorPattern[];
  streaks: SimuladoStreakMetrics;
  goals: SimuladoGoalsMetrics;
};

export type AnalyticsPeriodBounds = {
  start: Date;
  /** Limite superior exclusivo; para períodos rolling, usa instante atual + 1ms. */
  endExclusive: Date;
  /** YMD conservador para queries `gte` em `data_ref`. */
  queryStartYmd: string;
};

export function isTimestampInAnalyticsPeriod(iso: string, bounds: AnalyticsPeriodBounds): boolean {
  const instant = new Date(iso);
  return instant >= bounds.start && instant < bounds.endExclusive;
}

export function getAnalyticsPeriodBounds(
  periodo: SimuladoAnalyticsPeriod,
  now: Date = new Date(),
): AnalyticsPeriodBounds {
  if (periodo === '1d') {
    const { start, end } = getFreemiumDayBounds(now);
    const queryStart = new Date(start.getTime() - 86_400_000);
    return {
      start,
      endExclusive: end,
      queryStartYmd: toYmd(queryStart),
    };
  }

  const start = getPeriodStart(periodo, now);
  return {
    start,
    endExclusive: new Date(now.getTime() + 1),
    queryStartYmd: toYmd(start),
  };
}

export function getPeriodStart(periodo: SimuladoAnalyticsPeriod, now: Date = new Date()): Date {
  if (periodo === '1d') {
    return getFreemiumDayBounds(now).start;
  }
  const base = new Date(now);
  if (periodo === '7d') base.setDate(now.getDate() - 7);
  if (periodo === '30d') base.setDate(now.getDate() - 30);
  if (periodo === '90d') base.setDate(now.getDate() - 90);
  if (periodo === '12m') base.setMonth(now.getMonth() - 12);
  return base;
}

export function normalizeSessionMode(row: SimuladoSessionAnalyticsRow): 'treino' | 'prova' {
  if (row.modo === 'treino' || row.modo === 'prova') return row.modo;
  if (row.filtros && typeof row.filtros === 'object' && row.filtros.modo === 'prova') return 'prova';
  return 'treino';
}

function normalizeTextFilter(raw: string | null): string | null {
  const value = raw?.trim();
  return value && value.length > 0 ? value : null;
}

function matchesDimensionFilters(
  row: {
    banca?: string | null;
    topico?: string | null;
    subtopico?: string | null;
  },
  filters: SimuladoAnalyticsDimensionFilters,
): boolean {
  if (filters.banca && row.banca !== filters.banca) return false;
  if (filters.topico && row.topico !== filters.topico) return false;
  if (filters.subtopico && row.subtopico !== filters.subtopico) return false;
  return true;
}

function calculatePercentual(acertos: number, total: number): number | null {
  if (total <= 0) return null;
  return Number(((acertos / total) * 100).toFixed(2));
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Number(value.toFixed(2));
}

function computeStreaksFromDailyRows(rows: SimuladoAnalyticsDailyRow[]): SimuladoStreakMetrics {
  const uniqueDays = Array.from(new Set(rows.map((row) => row.data_ref))).sort();
  if (uniqueDays.length === 0) {
    return {
      dias_ativos_periodo: 0,
      streak_atual_dias: 0,
      melhor_streak_dias: 0,
    };
  }

  let bestStreak = 0;
  let currentWindowStreak = 0;
  let previousDay: Date | null = null;

  for (const day of uniqueDays) {
    const currentDay = new Date(`${day}T00:00:00.000Z`);
    if (!previousDay) {
      currentWindowStreak = 1;
    } else {
      const diffMs = currentDay.getTime() - previousDay.getTime();
      const diffDays = Math.round(diffMs / 86_400_000);
      currentWindowStreak = diffDays === 1 ? currentWindowStreak + 1 : 1;
    }
    if (currentWindowStreak > bestStreak) bestStreak = currentWindowStreak;
    previousDay = currentDay;
  }

  let currentStreak = 0;
  let cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  const daySet = new Set(uniqueDays);
  while (daySet.has(toYmd(cursor))) {
    currentStreak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  return {
    dias_ativos_periodo: uniqueDays.length,
    streak_atual_dias: currentStreak,
    melhor_streak_dias: bestStreak,
  };
}

function computeDimensionMetrics(
  rows: SimuladoAnalyticsSessionDimsRow[],
  key: 'banca' | 'topico' | 'subtopico',
): SimuladoDimensionMetric[] {
  const grouped = new Map<string, { total: number; acertos: number; erros: number }>();
  for (const row of rows) {
    const name = row[key] || 'N/A';
    const acc = grouped.get(name) ?? { total: 0, acertos: 0, erros: 0 };
    acc.total += row.total_questoes ?? 0;
    acc.acertos += row.acertos ?? 0;
    acc.erros += row.erros ?? 0;
    grouped.set(name, acc);
  }
  return Array.from(grouped.entries())
    .map(([nome, value]) => ({
      nome,
      total_questoes: value.total,
      acertos: value.acertos,
      erros: value.erros,
      percentual_acerto: calculatePercentual(value.acertos, value.total),
    }))
    .sort((a, b) => b.total_questoes - a.total_questoes)
    .slice(0, 12);
}

async function buildEvolucaoFromRespostas(
  supabase: SupabaseClient,
  userId: string,
  bounds: AnalyticsPeriodBounds,
  filters: SimuladoAnalyticsFilters,
): Promise<SimuladoEvolucaoItem[]> {
  let sessionsQuery = supabase
    .from('simulado_sessions')
    .select('id, status, modo, filtros, concluida_em, created_at')
    .eq('user_id', userId)
    .eq('status', 'concluido')
    .not('concluida_em', 'is', null)
    .gte('concluida_em', bounds.start.toISOString())
    .lt('concluida_em', bounds.endExclusive.toISOString())
    .order('concluida_em', { ascending: false })
    .limit(500);

  const { data: sessionsRaw, error: sessionsError } = await sessionsQuery;

  if (sessionsError || !sessionsRaw?.length) return [];

  const sessions = (sessionsRaw as SimuladoSessionAnalyticsRow[])
    .map((row) => ({ ...row, modo: normalizeSessionMode(row) }))
    .filter((row) => filters.modo === 'todos' || row.modo === filters.modo);

  if (sessions.length === 0) return [];

  const sessionById = new Map(
    sessions.map((row) => [row.id, toYmd(new Date(row.concluida_em ?? row.created_at))]),
  );

  const { data: respostas, error: respostasError } = await supabase
    .from('simulado_respostas')
    .select('session_id, acertou, tempo_ms')
    .eq('user_id', userId)
    .in('session_id', [...sessionById.keys()])
    .not('acertou', 'is', null);

  if (respostasError || !respostas?.length) return [];

  const evolucaoMap = new Map<
    string,
    { total_questoes: number; acertos: number; erros: number; tempo_total_ms: number }
  >();

  for (const row of respostas) {
    const dataRef = sessionById.get(row.session_id);
    if (!dataRef) continue;

    const acc = evolucaoMap.get(dataRef) ?? {
      total_questoes: 0,
      acertos: 0,
      erros: 0,
      tempo_total_ms: 0,
    };
    acc.total_questoes += 1;
    if (row.acertou === true) acc.acertos += 1;
    if (row.acertou === false) acc.erros += 1;
    acc.tempo_total_ms += row.tempo_ms ?? 0;
    evolucaoMap.set(dataRef, acc);
  }

  return Array.from(evolucaoMap.entries())
    .map(([data_ref, value]) => ({
      data_ref,
      total_questoes: value.total_questoes,
      acertos: value.acertos,
      erros: value.erros,
      percentual_acerto: calculatePercentual(value.acertos, value.total_questoes),
      tempo_total_ms: value.tempo_total_ms,
      tempo_medio_ms:
        value.total_questoes > 0 ? Math.round(value.tempo_total_ms / value.total_questoes) : null,
    }))
    .sort((a, b) => a.data_ref.localeCompare(b.data_ref));
}

export function normalizeSimuladoAnalyticsFilters(input: {
  periodoRaw: string | null;
  modoRaw: string | null;
  bancaRaw?: string | null;
  topicoRaw?: string | null;
  subtopicoRaw?: string | null;
  assuntoRaw?: string | null;
}): SimuladoAnalyticsFilters {
  const periodo = SIMULADO_ANALYTICS_PERIODS.includes(input.periodoRaw as SimuladoAnalyticsPeriod)
    ? (input.periodoRaw as SimuladoAnalyticsPeriod)
    : '30d';
  const modo = SIMULADO_ANALYTICS_MODES.includes(input.modoRaw as SimuladoAnalyticsMode)
    ? (input.modoRaw as SimuladoAnalyticsMode)
    : 'todos';
  return {
    periodo,
    modo,
    banca: normalizeTextFilter(input.bancaRaw ?? null),
    topico: normalizeTextFilter(input.topicoRaw ?? input.assuntoRaw ?? null),
    subtopico: normalizeTextFilter(input.subtopicoRaw ?? null),
  };
}

export async function loadSimuladoAnalyticsSummary(
  supabase: SupabaseClient,
  userId: string,
  filters: SimuladoAnalyticsFilters,
): Promise<SimuladoAnalyticsSummary> {
  const bounds = getAnalyticsPeriodBounds(filters.periodo);
  const periodStartYmd = bounds.queryStartYmd;

  const [sessionsResult, dailyResult, dimsResult] = await Promise.all([
    supabase
      .from('simulado_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('simulado_analytics_daily')
      .select('data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms')
      .eq('user_id', userId)
      .gte('data_ref', periodStartYmd)
      .order('data_ref', { ascending: true })
      .limit(5000),
    supabase
      .from('simulado_analytics_session_dims')
      .select(
        'session_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms',
      )
      .eq('user_id', userId)
      .gte('data_ref', periodStartYmd)
      .order('data_ref', { ascending: false })
      .limit(10000),
  ]);

  const rawSessions = sessionsResult.data;
  const dailyRowsRaw = (dailyResult.data ?? []) as SimuladoAnalyticsDailyRow[];
  const dimsRowsRaw = (dimsResult.data ?? []) as SimuladoAnalyticsSessionDimsRow[];

  const dailyRows = dailyRowsRaw.filter((row) => {
    if (filters.periodo === '1d') return false;
    if (filters.modo !== 'todos' && row.modo !== filters.modo) return false;
    return matchesDimensionFilters(row, filters);
  });

  let dimsRows = dimsRowsRaw.filter((row) => {
    if (filters.modo !== 'todos' && row.modo !== filters.modo) return false;
    return matchesDimensionFilters(row, filters);
  });

  const sessionsInPeriod = ((rawSessions ?? []) as SimuladoSessionAnalyticsRow[])
    .map((row) => ({ ...row, modo: normalizeSessionMode(row) }))
    .filter((row) => {
      if (filters.modo !== 'todos' && row.modo !== filters.modo) return false;
      const baseDate = row.concluida_em ?? row.created_at;
      return isTimestampInAnalyticsPeriod(baseDate, bounds);
    });

  const sessionIdsInPeriod = new Set(sessionsInPeriod.map((row) => row.id));

  if (filters.periodo === '1d') {
    dimsRows = dimsRows.filter((row) => sessionIdsInPeriod.has(row.session_id));
  }

  const matchingSessionIds = new Set(dimsRows.map((row) => row.session_id));
  const sessions = sessionsInPeriod.filter((row) => {
    if (!filters.banca && !filters.topico && !filters.subtopico) return true;
    return matchingSessionIds.has(row.id);
  });

  const completedSessions = sessions.filter((row) => row.status === 'concluido');
  const totalSimulados = completedSessions.length;
  const mediaAcerto =
    completedSessions.length > 0
      ? Number(
          (
            completedSessions.reduce((acc, row) => acc + (row.percentual_acerto ?? 0), 0) /
            completedSessions.length
          ).toFixed(2),
        )
      : null;
  const melhorScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((row) => row.percentual_acerto ?? 0))
      : null;
  const tempoMedioMs =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, row) => acc + (row.tempo_medio_ms ?? 0), 0) /
            completedSessions.length,
        )
      : null;
  const ultimasSessoes = sessions.slice(0, 8);

  const evolucaoMap = new Map<
    string,
    { total_questoes: number; acertos: number; erros: number; tempo_total_ms: number }
  >();
  for (const row of filters.periodo === '1d' ? dimsRows : dailyRows) {
    const acc = evolucaoMap.get(row.data_ref) ?? {
      total_questoes: 0,
      acertos: 0,
      erros: 0,
      tempo_total_ms: 0,
    };
    acc.total_questoes += row.total_questoes ?? 0;
    acc.acertos += row.acertos ?? 0;
    acc.erros += row.erros ?? 0;
    acc.tempo_total_ms += row.tempo_total_ms ?? 0;
    evolucaoMap.set(row.data_ref, acc);
  }
  let evolucaoTemporal = Array.from(evolucaoMap.entries())
    .map(([data_ref, value]) => ({
      data_ref,
      total_questoes: value.total_questoes,
      acertos: value.acertos,
      erros: value.erros,
      percentual_acerto: calculatePercentual(value.acertos, value.total_questoes),
      tempo_total_ms: value.tempo_total_ms,
      tempo_medio_ms:
        value.total_questoes > 0 ? Math.round(value.tempo_total_ms / value.total_questoes) : null,
    }))
    .sort((a, b) => a.data_ref.localeCompare(b.data_ref));

  if (evolucaoTemporal.length === 0 && completedSessions.length > 0) {
    evolucaoTemporal = await buildEvolucaoFromRespostas(supabase, userId, bounds, filters);
  }

  let mediaAcertoFinal = mediaAcerto;
  if (mediaAcertoFinal === null && evolucaoTemporal.length > 0) {
    const totalRespondidas = evolucaoTemporal.reduce((acc, row) => acc + row.total_questoes, 0);
    const totalAcertos = evolucaoTemporal.reduce((acc, row) => acc + row.acertos, 0);
    mediaAcertoFinal = calculatePercentual(totalAcertos, totalRespondidas);
  }

  let tempoMedioMsFinal = tempoMedioMs;
  if (tempoMedioMsFinal === null && evolucaoTemporal.length > 0) {
    const totalRespondidas = evolucaoTemporal.reduce((acc, row) => acc + row.total_questoes, 0);
    const totalTempo = evolucaoTemporal.reduce((acc, row) => acc + row.tempo_total_ms, 0);
    if (totalRespondidas > 0) {
      tempoMedioMsFinal = Math.round(totalTempo / totalRespondidas);
    }
  }

  const desempenhoPorBanca = computeDimensionMetrics(dimsRows, 'banca');
  const desempenhoPorTopico = computeDimensionMetrics(dimsRows, 'topico');
  const desempenhoPorSubtopico = computeDimensionMetrics(dimsRows, 'subtopico');

  const errorPatterns = dimsRows
    .map((row) => ({
      banca: row.banca,
      topico: row.topico,
      subtopico: row.subtopico,
      total_questoes: row.total_questoes ?? 0,
      erros: row.erros ?? 0,
      taxa_erro: calculatePercentual(row.erros ?? 0, row.total_questoes ?? 0),
    }))
    .filter((row) => row.total_questoes >= 3)
    .sort((a, b) => {
      const taxaA = a.taxa_erro ?? -1;
      const taxaB = b.taxa_erro ?? -1;
      if (taxaB !== taxaA) return taxaB - taxaA;
      return b.total_questoes - a.total_questoes;
    })
    .slice(0, 12);

  const streaks = computeStreaksFromDailyRows(dailyRows);

  const weeklyThreshold = new Date();
  weeklyThreshold.setDate(weeklyThreshold.getDate() - 7);
  const weeklySessions = sessions.filter((row) => {
    const baseDate = new Date(row.concluida_em ?? row.created_at);
    return baseDate >= weeklyThreshold;
  }).length;

  const monthlyThreshold = new Date();
  monthlyThreshold.setDate(monthlyThreshold.getDate() - 30);
  const monthlyQuestions = dailyRows
    .filter((row) => new Date(`${row.data_ref}T00:00:00.000Z`) >= monthlyThreshold)
    .reduce((acc, row) => acc + (row.total_questoes ?? 0), 0);

  const goals: SimuladoGoalsMetrics = {
    meta_semanal_sessoes: 3,
    sessoes_ultimos_7d: weeklySessions,
    progresso_meta_semanal: clampProgress((weeklySessions / 3) * 100),
    meta_mensal_questoes: 120,
    questoes_ultimos_30d: monthlyQuestions,
    progresso_meta_mensal: clampProgress((monthlyQuestions / 120) * 100),
  };

  return {
    sessions,
    completedSessions,
    totalSimulados,
    mediaAcerto: mediaAcertoFinal,
    melhorScore,
    tempoMedioMs: tempoMedioMsFinal,
    ultimasSessoes,
    evolucaoTemporal,
    desempenhoPorBanca,
    desempenhoPorTopico,
    desempenhoPorSubtopico,
    errorPatterns,
    streaks,
    goals,
  };
}
