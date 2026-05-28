/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/estudar/questao/route';

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

const mockBuildEstudarQuestaoPlayerPayload = jest.fn();
jest.mock('@/lib/estudar/questaoPlayerPayload', () => ({
  buildEstudarQuestaoPlayerPayload: jest.fn((...args: unknown[]) =>
    mockBuildEstudarQuestaoPlayerPayload(...args),
  ),
}));

const mockRecordPerformance = jest.fn();
jest.mock('@/lib/metrics', () => ({
  recordPerformance: jest.fn((...args: unknown[]) => mockRecordPerformance(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-prefetch-api';

const payloadOk = {
  dados: {
    meta: { banca: 'FGV', topico: 'Urgências' },
    question_data: {
      instruction: 'Enunciado',
      options: [
        { id: 'A', text: 'Opção A' },
        { id: 'B', text: 'Opção B' },
      ],
    },
  },
  mode: 'live' as const,
  proximaSlug: 'proxima-questao',
  anteriorSlug: null,
  moduloSlug: SLUG,
  questoesDoAssunto: [{ slug: SLUG, estudada: false }],
  fromPlano: false,
  vitrineQuerySuffix: '',
};

describe('GET /api/estudar/questao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
  });

  function makeRequest(query: Record<string, string>) {
    const params = new URLSearchParams(query);
    return new NextRequest(`https://avant.test/api/estudar/questao?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockBuildEstudarQuestaoPlayerPayload).not.toHaveBeenCalled();
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), false);
  });

  it('retorna 403 quando builder indica forbidden', async () => {
    mockBuildEstudarQuestaoPlayerPayload.mockResolvedValue({ status: 'forbidden' });

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Sem acesso a este módulo' });
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), false);
  });

  it('retorna 404 quando builder indica not_found', async () => {
    mockBuildEstudarQuestaoPlayerPayload.mockResolvedValue({ status: 'not_found' });

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Questão não encontrada' });
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), false);
  });

  it('retorna 400 com slug ausente', async () => {
    const response = await GET(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockBuildEstudarQuestaoPlayerPayload).not.toHaveBeenCalled();
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), false);
  });

  it('retorna 200 com payload do player e Cache-Control private', async () => {
    mockBuildEstudarQuestaoPlayerPayload.mockResolvedValue({
      status: 'ok',
      payload: payloadOk,
    });

    const response = await GET(
      makeRequest({ slug: SLUG, banca: 'FGV', assunto: 'Urgências' }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payloadOk);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockBuildEstudarQuestaoPlayerPayload).toHaveBeenCalledWith({
      slug: SLUG,
      userId: USER_ID,
      searchParams: {
        from: undefined,
        caderno_id: undefined,
        banca: 'FGV',
        assunto: 'Urgências',
        q: undefined,
      },
      supabase: expect.any(Object),
    });
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), true);
  });

  it('retorna payload enxuto quando context=simulado', async () => {
    mockBuildEstudarQuestaoPlayerPayload.mockResolvedValue({
      status: 'ok',
      payload: payloadOk,
    });

    const response = await GET(makeRequest({ slug: SLUG, context: 'simulado' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ dados: payloadOk.dados });
    expect(mockBuildEstudarQuestaoPlayerPayload).toHaveBeenCalledWith({
      slug: SLUG,
      userId: USER_ID,
      searchParams: {
        from: undefined,
        caderno_id: undefined,
        banca: undefined,
        assunto: undefined,
        q: undefined,
      },
      supabase: expect.any(Object),
    });
  });

  it('retorna 500 quando ocorre erro inesperado no builder', async () => {
    mockBuildEstudarQuestaoPlayerPayload.mockRejectedValue(new Error('boom'));

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno' });
    expect(mockRecordPerformance).toHaveBeenCalledWith('/api/estudar/questao', 'GET', expect.any(Number), false);
  });
});
