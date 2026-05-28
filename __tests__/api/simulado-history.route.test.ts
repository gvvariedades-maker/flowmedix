/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockGetUserAndClientFromBearer = jest.fn();
const mockLoadSimuladoHistory = jest.fn();
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

jest.mock('@/lib/simulado/history', () => ({
  loadSimuladoHistory: (...args: unknown[]) => mockLoadSimuladoHistory(...args),
}));

jest.mock('@/lib/simulado/analyticsSummary', () => ({
  normalizeSimuladoAnalyticsFilters: (...args: unknown[]) => mockNormalizeSimuladoAnalyticsFilters(...args),
}));

jest.mock('@/lib/performance-tracker', () => ({
  withPerformanceTracking: (handler: unknown) => handler,
}));

import { GET } from '@/app/api/simulado/history/route';

describe('GET /api/simulado/history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 400 com query inválida', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    const req = new NextRequest('https://avant.test/api/simulado/history?page=0');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('retorna sessões paginadas com cache privado curto', async () => {
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
    mockLoadSimuladoHistory.mockResolvedValue({
      total: 1,
      page: 1,
      page_size: 20,
      sessions: [
        {
          id: 'sess-1',
          status: 'concluido',
          modo: 'treino',
          total_questoes: 10,
          acertos: 7,
          erros: 3,
          percentual_acerto: 70,
          tempo_total_ms: 400000,
          tempo_medio_ms: 40000,
          created_at: '2026-05-20T10:00:00.000Z',
          concluida_em: '2026-05-20T10:08:00.000Z',
        },
      ],
    });

    const req = new NextRequest('https://avant.test/api/simulado/history?periodo=30d&page=1&page_size=20');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('private');
    expect(body.pagination.total).toBe(1);
    expect(body.sessions[0]).toMatchObject({ id: 'sess-1', percentual_acerto: 70 });
    expect(mockLoadSimuladoHistory).toHaveBeenCalled();
  });
});
