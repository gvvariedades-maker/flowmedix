/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/vitrine/route';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockGetVitrinePageCached = jest.fn();
jest.mock('@/lib/cache', () => ({
  getVitrinePageCached: jest.fn((...args: unknown[]) => mockGetVitrinePageCached(...args)),
}));

const mockRecordPerformance = jest.fn();
jest.mock('@/lib/metrics', () => ({
  recordPerformance: jest.fn((...args: unknown[]) => mockRecordPerformance(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const payloadOk = {
  groups: [
    {
      tituloAula: 'Urgências e Emergências',
      questoes: [{ slug: 'q-1', titulo: 'Q1' }],
      totalQuestoes: 1,
      stats: { acertos: 1, total: 1, percentual: 100 },
    },
  ],
  facets: { bancas: ['FGV'], assuntos: ['Urgências e Emergências'] },
  pagination: {
    page: 1,
    perPage: 12,
    totalGroups: 1,
    totalPages: 1,
  },
  totalModulosFiltrados: 1,
};

describe('GET /api/vitrine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
  });

  function makeRequest(query: Record<string, string | string[]>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
    return new NextRequest(`https://avant.test/api/vitrine?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest({ page: '1' }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockGetVitrinePageCached).not.toHaveBeenCalled();
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/vitrine', 'GET', expect.any(Number), false);
  });

  it('retorna 400 para parâmetros inválidos', async () => {
    const response = await GET(makeRequest({ page: '0' }));

    expect(response.status).toBe(400);
    expect(mockGetVitrinePageCached).not.toHaveBeenCalled();
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/vitrine', 'GET', expect.any(Number), false);
  });

  it('retorna 200 com payload da vitrine e Cache-Control private', async () => {
    mockGetVitrinePageCached.mockResolvedValue(payloadOk);

    const response = await GET(
      makeRequest({ page: '1', banca: 'FGV', assunto: 'Urgências e Emergências', q: 'choque' }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payloadOk);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockGetVitrinePageCached).toHaveBeenCalledWith(
      USER_ID,
      1,
      { bancas: ['FGV'], assuntos: ['Urgências e Emergências'], q: 'choque' },
      false,
    );
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/vitrine', 'GET', expect.any(Number), true);
  });

  it('retorna 200 com múltiplas bancas e assuntos (bancas/assuntos)', async () => {
    mockGetVitrinePageCached.mockResolvedValue(payloadOk);

    const response = await GET(
      makeRequest({
        page: '1',
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências', 'Farmacologia'],
      }),
    );

    expect(response.status).toBe(200);
    expect(mockGetVitrinePageCached).toHaveBeenCalledWith(
      USER_ID,
      1,
      {
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências', 'Farmacologia'],
      },
      false,
    );
  });

  it('retorna 200 com múltiplas bancas legado (?banca=A&banca=B)', async () => {
    mockGetVitrinePageCached.mockResolvedValue(payloadOk);

    const response = await GET(
      makeRequest({
        page: '1',
        banca: ['FGV', 'CESPE'],
        assunto: ['Urgências e Emergências', 'Farmacologia'],
      }),
    );

    expect(response.status).toBe(200);
    expect(mockGetVitrinePageCached).toHaveBeenCalledWith(
      USER_ID,
      1,
      {
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências', 'Farmacologia'],
      },
      false,
    );
  });

  it('retorna 500 quando ocorre erro inesperado ao montar a vitrine', async () => {
    mockGetVitrinePageCached.mockRejectedValue(new Error('boom'));

    const response = await GET(makeRequest({ page: '1' }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno' });
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/vitrine', 'GET', expect.any(Number), false);
  });
});
