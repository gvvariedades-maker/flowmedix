/**
 * P4 — série temporal a partir de `evidence_attempt_events` (regular_practice).
 * Fallback explícito quando `EE_V1_INSTRUMENTATION` está off — P0 (histórico) segue.
 */

import type {
  AttemptSeriesData,
  AttemptSeriesDay,
  AttemptSeriesEventRow,
  DesempenhoPeriodo,
} from '@/lib/desempenho/types';
import {
  eachDesempenhoDayKey,
  getDesempenhoPeriodRange,
  isWithinDesempenhoPeriod,
  toDesempenhoDayKey,
} from '@/lib/desempenho/periodo';

export type AggregateAttemptSeriesOptions = {
  periodo: DesempenhoPeriodo;
  now?: Date;
  /** ISO da prática mais antiga no histórico (para detectar cobertura parcial). */
  historicoOldestAt?: string | null;
  /** Respondidas distintas no histórico (P0) — comparação de cobertura. */
  historicoRespondidas?: number | null;
  /** Leitura bateu no teto de registros — série parcial, avisada na UI. */
  truncated?: boolean;
  /** Teto aplicado na leitura. */
  limiteRegistros?: number | null;
};

/** Fallback estável quando a flag está off ou a leitura falha. */
export function emptyAttemptSeries(
  reason: AttemptSeriesData['unavailableReason'],
): AttemptSeriesData {
  return {
    available: false,
    unavailableReason: reason,
    daily: [],
    tempoMedioMs: null,
    firstAttemptAccuracyPct: null,
    attemptsPerQuestionAvg: null,
    totalEvents: 0,
    distinctQuestions: 0,
    dadosDesde: null,
    coberturaParcial: false,
    truncated: false,
    limiteRegistros: null,
  };
}

/**
 * Agrega eventos `regular_practice` em série diária + KPIs de tempo / 1ª tentativa.
 * Função pura — sem I/O (testável).
 */
export function aggregateAttemptSeries(
  events: readonly AttemptSeriesEventRow[],
  options: AggregateAttemptSeriesOptions,
): AttemptSeriesData {
  const now = options.now ?? new Date();
  const range = getDesempenhoPeriodRange(options.periodo, now);
  const truncated = options.truncated ?? false;
  const limiteRegistros = options.limiteRegistros ?? null;

  const filtered = events.filter((e) => {
    if (e.context !== 'regular_practice') return false;
    return isWithinDesempenhoPeriod(e.created_at, range);
  });

  if (filtered.length === 0) {
    return {
      ...emptyAttemptSeries('empty'),
      available: true,
      unavailableReason: 'empty',
      truncated,
      limiteRegistros,
    };
  }

  const sorted = [...filtered].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const dadosDesde = sorted[0]!.created_at;

  const byDay = new Map<string, { attempts: number; acertos: number }>();
  for (const e of sorted) {
    const key = toDesempenhoDayKey(e.created_at, now);
    const cur = byDay.get(key) ?? { attempts: 0, acertos: 0 };
    cur.attempts += 1;
    if (e.correct) cur.acertos += 1;
    byDay.set(key, cur);
  }

  const dayKeys = eachDesempenhoDayKey(range, toDesempenhoDayKey(dadosDesde, now));
  const daily: AttemptSeriesDay[] = dayKeys.map((date) => {
    const stats = byDay.get(date);
    if (!stats || stats.attempts === 0) {
      return { date, attempts: 0, acertos: 0, percentual: null };
    }
    return {
      date,
      attempts: stats.attempts,
      acertos: stats.acertos,
      percentual: Math.round((stats.acertos / stats.attempts) * 100),
    };
  });

  let tempoSum = 0;
  let tempoCount = 0;
  for (const e of sorted) {
    if (e.response_time_status !== 'valid') continue;
    if (typeof e.response_time_ms !== 'number' || !Number.isFinite(e.response_time_ms)) continue;
    if (e.response_time_ms < 0) continue;
    tempoSum += e.response_time_ms;
    tempoCount += 1;
  }
  const tempoMedioMs = tempoCount > 0 ? Math.round(tempoSum / tempoCount) : null;

  const firstByQuestion = new Map<string, AttemptSeriesEventRow>();
  const attemptsByQuestion = new Map<string, number>();
  for (const e of sorted) {
    attemptsByQuestion.set(e.question_id, (attemptsByQuestion.get(e.question_id) ?? 0) + 1);
    if (!firstByQuestion.has(e.question_id)) {
      firstByQuestion.set(e.question_id, e);
    }
  }

  const distinctQuestions = firstByQuestion.size;
  let firstCorrect = 0;
  for (const first of firstByQuestion.values()) {
    if (first.correct) firstCorrect += 1;
  }
  const firstAttemptAccuracyPct =
    distinctQuestions > 0 ? Math.round((firstCorrect / distinctQuestions) * 100) : null;

  const attemptsPerQuestionAvg =
    distinctQuestions > 0
      ? Math.round((sorted.length / distinctQuestions) * 10) / 10
      : null;

  const historicoOldest = options.historicoOldestAt
    ? new Date(options.historicoOldestAt)
    : null;
  const ledgerStart = new Date(dadosDesde);
  const historicoPredatesLedger =
    historicoOldest != null &&
    !Number.isNaN(historicoOldest.getTime()) &&
    historicoOldest.getTime() < ledgerStart.getTime();
  const historicoCount = options.historicoRespondidas ?? null;
  const countGap =
    historicoCount != null && historicoCount > distinctQuestions;

  return {
    available: true,
    unavailableReason: null,
    daily,
    tempoMedioMs,
    firstAttemptAccuracyPct,
    attemptsPerQuestionAvg,
    totalEvents: sorted.length,
    distinctQuestions,
    dadosDesde,
    coberturaParcial: historicoPredatesLedger || Boolean(countGap) || truncated,
    truncated,
    limiteRegistros,
  };
}

const EVENT_SELECT =
  'attempt_id, question_id, correct, response_time_ms, response_time_status, created_at, context';

type LedgerReadResult = {
  events: AttemptSeriesEventRow[];
  /** Bateu no teto: existem eventos mais antigos fora da série. */
  truncated: boolean;
  limite: number;
};

/**
 * Lê o ledger do **mais recente para o mais antigo** e reordena em memória.
 *
 * Ordenar ascendente antes do `limit` descartaria justamente os eventos recentes
 * quando o usuário passa do teto (`SCALE_LIMITS.HISTORICO_ANALYTICS_READ`).
 */
async function fetchRegularPracticeEvents(userId: string): Promise<LedgerReadResult> {
  const { createServerSupabase } = await import('@/lib/supabase/server');
  const { withPostgrestReadRetry } = await import('@/lib/supabaseReadRetry');
  const { SCALE_LIMITS } = await import('@/lib/scale/constants');
  const { logger } = await import('@/lib/logger');
  const { DataServiceUnavailableError } = await import('@/lib/dataServiceError');

  const limite = SCALE_LIMITS.HISTORICO_ANALYTICS_READ;

  try {
    const supabase = await createServerSupabase();
    const data = await withPostgrestReadRetry(
      `evidence_attempt_events:desempenho:${userId.slice(0, 8)}…`,
      async () =>
        supabase
          .from('evidence_attempt_events')
          .select(EVENT_SELECT)
          .eq('user_id', userId)
          .eq('context', 'regular_practice')
          .eq('event_type', 'attempt')
          .order('created_at', { ascending: false })
          .limit(limite),
    );

    const rows = (data ?? []) as AttemptSeriesEventRow[];
    const truncated = rows.length >= limite;
    if (truncated) {
      logger.warn('Ledger de desempenho truncado no teto de leitura', {
        userId,
        limite,
      });
    }

    return {
      // Reordena cronologicamente para a agregação diária.
      events: [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at)),
      truncated,
      limite,
    };
  } catch (error) {
    logger.error('Failed to fetch evidence_attempt_events for desempenho', error, {
      userId,
    });
    throw new DataServiceUnavailableError();
  }
}

async function getCachedRegularPracticeEvents(userId: string): Promise<LedgerReadResult> {
  const { unstable_cache } = await import('next/cache');
  const { CACHE_CONFIG } = await import('@/lib/cache');
  const cacheKey = `desempenho-attempt-series-${userId}`;

  return unstable_cache(
    async () => fetchRegularPracticeEvents(userId),
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['analytics', 'historico', 'evidence', `user-${userId}`],
    },
  )();
}

export type GetAttemptSeriesParams = {
  userId: string;
  periodo: DesempenhoPeriodo;
  now?: Date;
  historicoOldestAt?: string | null;
  historicoRespondidas?: number | null;
  /** Override de flag (testes). */
  instrumentationEnabled?: boolean;
};

/** Leitura bruta do ledger — a agregação (oldest/cobertura) espera o histórico P0. */
export type AttemptSeriesRead =
  | { status: 'flag_off' }
  | { status: 'error' }
  | {
      status: 'ok';
      events: AttemptSeriesEventRow[];
      truncated: boolean;
      limite: number;
    };

/**
 * Começa a I/O do ledger sem precisar do histórico (só `userId` + flag).
 * Flag off → resolve na hora, sem query.
 */
export async function beginAttemptSeriesRead(
  userId: string,
  instrumentationEnabled?: boolean,
): Promise<AttemptSeriesRead> {
  const { isEvidenceV1InstrumentationEnabled } = await import('@/lib/env');
  const enabled = instrumentationEnabled ?? isEvidenceV1InstrumentationEnabled();

  if (!enabled) {
    return { status: 'flag_off' };
  }

  try {
    const { events, truncated, limite } = await getCachedRegularPracticeEvents(userId);
    return { status: 'ok', events, truncated, limite };
  } catch {
    return { status: 'error' };
  }
}

/** Agrega a leitura do ledger com metadados do histórico P0. */
export function finishAttemptSeries(
  read: AttemptSeriesRead,
  options: AggregateAttemptSeriesOptions,
): AttemptSeriesData {
  if (read.status === 'flag_off') return emptyAttemptSeries('flag_off');
  if (read.status === 'error') return emptyAttemptSeries('error');
  return aggregateAttemptSeries(read.events, {
    ...options,
    truncated: read.truncated,
    limiteRegistros: read.limite,
  });
}

/**
 * Orquestra flag + leitura do ledger + agregação.
 * Flag off → `available: false` sem query (P0 intacto).
 */
export async function getAttemptSeriesData(
  params: GetAttemptSeriesParams,
): Promise<AttemptSeriesData> {
  const read = await beginAttemptSeriesRead(params.userId, params.instrumentationEnabled);
  return finishAttemptSeries(read, {
    periodo: params.periodo,
    now: params.now,
    historicoOldestAt: params.historicoOldestAt,
    historicoRespondidas: params.historicoRespondidas,
  });
}
