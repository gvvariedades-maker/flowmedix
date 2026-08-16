import { getHistoricoCompleto } from '@/lib/analytics';
import { getModulosEstudoForUserCached } from '@/lib/cache';
import { beginAttemptSeriesRead } from '@/lib/desempenho/attemptSeries';
import {
  getDesempenhoEstudoData,
  loadDesempenhoEstudoCore,
} from '@/lib/desempenho/studyPerformance';

jest.mock('@/lib/analytics', () => ({
  getHistoricoCompleto: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  getModulosEstudoForUserCached: jest.fn(),
}));

jest.mock('@/lib/env', () => ({
  isEvidenceV1InstrumentationEnabled: jest.fn(() => true),
}));

jest.mock('@/lib/desempenho/attemptSeries', () => {
  const actual = jest.requireActual('@/lib/desempenho/attemptSeries') as typeof import('@/lib/desempenho/attemptSeries');
  return {
    ...actual,
    beginAttemptSeriesRead: jest.fn(),
  };
});

const mockedHist = getHistoricoCompleto as jest.MockedFunction<typeof getHistoricoCompleto>;
const mockedCatalog = getModulosEstudoForUserCached as jest.MockedFunction<
  typeof getModulosEstudoForUserCached
>;
const mockedBegin = beginAttemptSeriesRead as jest.MockedFunction<typeof beginAttemptSeriesRead>;

const NOW = new Date('2026-08-11T15:00:00.000Z');

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('loadDesempenhoEstudoCore — onda 2', () => {
  beforeEach(() => {
    mockedHist.mockReset();
    mockedCatalog.mockReset();
    mockedBegin.mockReset();
  });

  it('dispara o ledger EE antes do histórico resolver', async () => {
    const order: string[] = [];

    mockedHist.mockImplementation(async () => {
      order.push('hist-start');
      await delay(40);
      order.push('hist-end');
      return [];
    });
    mockedCatalog.mockImplementation(async () => {
      order.push('cat-start');
      await delay(40);
      order.push('cat-end');
      return [];
    });
    mockedBegin.mockImplementation(async () => {
      order.push('ledger-start');
      await delay(40);
      order.push('ledger-end');
      return { status: 'ok', events: [], truncated: false, limite: 5000 };
    });

    await getDesempenhoEstudoData('user-1', { periodo: 'all' }, NOW, {
      instrumentationEnabled: true,
    });

    expect(order.indexOf('ledger-start')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('ledger-start')).toBeLessThan(order.indexOf('hist-end'));
    expect(mockedBegin).toHaveBeenCalledWith('user-1', true);
  });

  it('não lê o ledger em mapa/histórico (startAttemptSeries=false)', async () => {
    mockedHist.mockResolvedValue([]);
    mockedCatalog.mockResolvedValue([]);

    const core = await loadDesempenhoEstudoCore('user-1', { periodo: 'all' }, NOW, {
      startAttemptSeries: false,
      instrumentationEnabled: true,
    });

    expect(mockedBegin).not.toHaveBeenCalled();
    expect(core.seriesReadPromise).toBeNull();
    expect(core.data.attemptSeries.unavailableReason).toBe('flag_off');
  });
});
