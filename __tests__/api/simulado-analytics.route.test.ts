/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockGetUserAndClientFromBearer = jest.fn();
const mockLoadSimuladoAnalyticsSummary = jest.fn();
const mockNormalizeSimuladoAnalyticsFilters = jest.fn();

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/simulado/analyticsSummary', () => ({
  loadSimuladoAnalyticsSummary: (...args: unknown[]) => mockLoadSimuladoAnalyticsSummary(...args),
  normalizeSimuladoAnalyticsFilters: (...args: unknown[]) => mockNormalizeSimuladoAnalyticsFilters(...args),
}));

jest.mock('@/lib/performance-tracker', () => ({
  withPerformanceTracking: (handler: unknown) => handler,
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/simulado/analyticsSync', () => ({
  syncPendingSimuladoAnalytics: jest.fn().mockResolvedValue(undefined),
}));

import { GET } from '@/app/api/simulado/analytics/route';

describe('GET /api/simulado/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 quando não autenticado', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);
    const req = new NextRequest('https://avant.test/api/simulado/analytics');

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('retorna payload esperado com headers de cache', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    mockNormalizeSimuladoAnalyticsFilters.mockReturnValue({
      periodo: '30d',
      modo: 'todos',
      banca: null,
      topico: null,
      subtopico: null,
    });
    mockLoadSimuladoAnalyticsSummary.mockResolvedValue({
      totalSimulados: 2,
      mediaAcerto: 75,
      melhorScore: 90,
      tempoMedioMs: 32000,
      evolucaoTemporal: [],
      desempenhoPorBanca: [],
      desempenhoPorTopico: [],
      desempenhoPorSubtopico: [],
      errorPatterns: [],
      streaks: { dias_ativos_periodo: 2, streak_atual_dias: 1, melhor_streak_dias: 2 },
      goals: {
        meta_semanal_sessoes: 3,
        sessoes_ultimos_7d: 2,
        progresso_meta_semanal: 66.67,
        meta_mensal_questoes: 120,
        questoes_ultimos_30d: 40,
        progresso_meta_mensal: 33.33,
      },
      ultimasSessoes: [],
    });

    const req = new NextRequest('https://avant.test/api/simulado/analytics?periodo=30d');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('private');
    expect(body.kpis.total_simulados).toBe(2);
    expect(mockLoadSimuladoAnalyticsSummary).toHaveBeenCalled();
  });
});
