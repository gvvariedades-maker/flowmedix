/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/simulado/pool-count/route';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/e2e/bypass', () => ({
  isE2eBypassEnabled: jest.fn(() => false),
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockFetchSimuladoQuestionPoolCountFromRpc = jest.fn();
jest.mock('@/lib/simulado/rpc', () => ({
  fetchSimuladoQuestionPoolCountFromRpc: jest.fn((...args: unknown[]) =>
    mockFetchSimuladoQuestionPoolCountFromRpc(...args),
  ),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/simulado/pool-count', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
    mockFetchSimuladoQuestionPoolCountFromRpc.mockResolvedValue(42);
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
    return new NextRequest(`https://avant.test/api/simulado/pool-count?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest({}));

    expect(response.status).toBe(401);
    expect(mockFetchSimuladoQuestionPoolCountFromRpc).not.toHaveBeenCalled();
  });

  it('retorna 400 para query inválida', async () => {
    const response = await GET(makeRequest({ q: 'x'.repeat(201) }));

    expect(response.status).toBe(400);
    expect(mockFetchSimuladoQuestionPoolCountFromRpc).not.toHaveBeenCalled();
  });

  it('retorna 200 com múltiplas bancas e assuntos (bancas/assuntos)', async () => {
    const response = await GET(
      makeRequest({
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências', 'Farmacologia'],
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ estimated_count: 42 });
    expect(mockFetchSimuladoQuestionPoolCountFromRpc).toHaveBeenCalledWith({
      userId: USER_ID,
      filters: {
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências', 'Farmacologia'],
      },
    });
  });

  it('retorna 200 com múltiplas bancas legado (?banca=A&banca=B)', async () => {
    const response = await GET(
      makeRequest({
        banca: ['FGV', 'CESPE'],
        assunto: ['Urgências e Emergências'],
      }),
    );

    expect(response.status).toBe(200);
    expect(mockFetchSimuladoQuestionPoolCountFromRpc).toHaveBeenCalledWith({
      userId: USER_ID,
      filters: {
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências e Emergências'],
      },
    });
  });
});
