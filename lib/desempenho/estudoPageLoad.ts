import { redirect } from 'next/navigation';
import {
  aggregateStudyPerformance,
  getDesempenhoEstudoData,
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

export async function loadEstudoDashboard(
  filters: DesempenhoEstudoFilters,
  opts?: { captura?: string | null; recentLimit?: number },
): Promise<DesempenhoEstudoData> {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');
  if (e2eBypass) {
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

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  try {
    return await getDesempenhoEstudoData(session.user.id, filters, new Date(), {
      recentLimit: opts?.recentLimit,
    });
  } catch (error) {
    logger.error('Failed to load desempenho estudo', error, { userId: session.user.id });
    return aggregateStudyPerformance(
      [],
      [],
      filters,
      new Date(),
      'error',
      opts?.recentLimit,
    );
  }
}
