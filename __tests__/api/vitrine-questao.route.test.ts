/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/vitrine/questao/route';

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

const mockResolveQuestaoInAssunto = jest.fn();
jest.mock('@/lib/vitrine/resolveQuestao', () => ({
  resolveQuestaoInAssunto: jest.fn((...args: unknown[]) => mockResolveQuestaoInAssunto(...args)),
  ResolveQuestaoInvalidAlvoError: class ResolveQuestaoInvalidAlvoError extends Error {
    name = 'ResolveQuestaoInvalidAlvoError';
  },
  ResolveQuestaoNotFoundError: class ResolveQuestaoNotFoundError extends Error {
    name = 'ResolveQuestaoNotFoundError';
  },
}));

const mockRecordPerformance = jest.fn();
jest.mock('@/lib/metrics', () => ({
  recordPerformance: jest.fn((...args: unknown[]) => mockRecordPerformance(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/vitrine/questao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
    mockResolveQuestaoInAssunto.mockResolvedValue({
      slug: 'q-processo-847',
      numero: 847,
      totalQuestoes: 1067,
      avant_codigo: 500847,
    });
  });

  function makeRequest(query: Record<string, string>) {
    const params = new URLSearchParams(query);
    return new NextRequest(`https://avant.test/api/vitrine/questao?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);
    const response = await GET(makeRequest({ assunto: 'Processo de Enfermagem', alvo: '847' }));
    expect(response.status).toBe(401);
  });

  it('retorna 400 sem parâmetros obrigatórios', async () => {
    const response = await GET(makeRequest({ assunto: 'Processo de Enfermagem' }));
    expect(response.status).toBe(400);
  });

  it('retorna 200 com slug resolvido', async () => {
    const response = await GET(
      makeRequest({ assunto: 'Processo de Enfermagem', alvo: '847', banca: 'IDECAN' }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.slug).toBe('q-processo-847');
    expect(mockResolveQuestaoInAssunto).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        assunto: 'Processo de Enfermagem',
        alvo: '847',
        bancas: ['IDECAN'],
      }),
    );
  });
});
