import { redirect } from 'next/navigation';
import type { AttemptSeriesRead } from '@/lib/desempenho/attemptSeries';
import {
  aggregateStudyPerformance,
  loadDesempenhoEstudoCore,
  resolveAttemptSeriesOnCore,
  type DesempenhoEstudoCoreLoad,
} from '@/lib/desempenho/studyPerformance';
import type { DesempenhoEstudoData, DesempenhoEstudoFilters } from '@/lib/desempenho/types';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import {
  getE2eDesempenhoEstudoData,
  getE2eDesempenhoEstudoPlacarZeradoComSerie,
  getE2eDesempenhoHistoricoCursor,
  getE2eDesempenhoLeituraTruncada,
  getE2eDesempenhoLoadError,
} from '@/lib/e2e/desempenhoSeed';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/supabase/server-auth';

export type LoadEstudoDashboardOpts = {
  captura?: string | null;
  recentLimit?: number;
  /**
   * Hub Estudo: dispara o ledger EE. Mapa/histórico não usam a curva —
   * deixar false evita a query extra.
   */
  startAttemptSeries?: boolean;
};

export type EstudoDashboardStream = {
  data: DesempenhoEstudoData;
  seriesReadPromise: Promise<AttemptSeriesRead> | null;
  seriesOptions: DesempenhoEstudoCoreLoad['seriesOptions'] | null;
};

function e2eDashboardData(
  filters: DesempenhoEstudoFilters,
  opts?: LoadEstudoDashboardOpts,
): DesempenhoEstudoData | null {
  if (!isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) return null;
  if (opts?.captura === 'placar-zerado') {
    return getE2eDesempenhoEstudoPlacarZeradoComSerie(filters);
  }
  if (opts?.captura === 'historico-cursor') {
    return getE2eDesempenhoHistoricoCursor(filters, opts?.recentLimit);
  }
  if (opts?.captura === 'leitura-truncada') {
    return getE2eDesempenhoLeituraTruncada(filters);
  }
  if (opts?.captura === 'erro') {
    return getE2eDesempenhoLoadError(filters);
  }
  return getE2eDesempenhoEstudoData(filters, opts?.recentLimit);
}

function errorFallback(
  filters: DesempenhoEstudoFilters,
  recentLimit?: number,
): DesempenhoEstudoData {
  return aggregateStudyPerformance([], [], filters, new Date(), 'error', recentLimit);
}

/**
 * P0 do hub (placar/mapa/histórico). Sem ledger EE — mapa e histórico não
 * renderizam a curva. O hub Estudo usa `loadEstudoDashboardStream`.
 */
export async function loadEstudoDashboard(
  filters: DesempenhoEstudoFilters,
  opts?: LoadEstudoDashboardOpts,
): Promise<DesempenhoEstudoData> {
  const e2e = e2eDashboardData(filters, opts);
  if (e2e) return e2e;

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  try {
    const core = await loadDesempenhoEstudoCore(session.user.id, filters, new Date(), {
      recentLimit: opts?.recentLimit,
      startAttemptSeries: opts?.startAttemptSeries ?? false,
    });
    return resolveAttemptSeriesOnCore(core);
  } catch (error) {
    logger.error('Failed to load desempenho estudo', error, { userId: session.user.id });
    return errorFallback(filters, opts?.recentLimit);
  }
}

/**
 * Hub `/desempenho`: P0 completo + promise do ledger já disparada.
 * O RSC do placar não espera a série — um Suspense interno resolve o card P4.
 */
export async function loadEstudoDashboardStream(
  filters: DesempenhoEstudoFilters,
  opts?: LoadEstudoDashboardOpts,
): Promise<EstudoDashboardStream> {
  const e2e = e2eDashboardData(filters, opts);
  if (e2e) {
    return { data: e2e, seriesReadPromise: null, seriesOptions: null };
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  try {
    const core = await loadDesempenhoEstudoCore(session.user.id, filters, new Date(), {
      recentLimit: opts?.recentLimit,
      startAttemptSeries: true,
    });
    return {
      data: core.data,
      seriesReadPromise: core.seriesReadPromise,
      seriesOptions: core.seriesOptions,
    };
  } catch (error) {
    logger.error('Failed to load desempenho estudo', error, { userId: session.user.id });
    return {
      data: errorFallback(filters, opts?.recentLimit),
      seriesReadPromise: null,
      seriesOptions: null,
    };
  }
}
