/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/simulado/questao/route';

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

const mockBuildSimuladoQuestaoPayload = jest.fn();
jest.mock('@/lib/estudar/questaoSimuladoPayload', () => ({
  buildSimuladoQuestaoPayload: jest.fn((...args: unknown[]) =>
    mockBuildSimuladoQuestaoPayload(...args),
  ),
}));

const mockRecordPerformance = jest.fn();
jest.mock('@/lib/metrics', () => ({
  recordPerformance: jest.fn((...args: unknown[]) => mockRecordPerformance(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-simulado-api';

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
};

describe('GET /api/simulado/questao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
  });

  function makeRequest(query: Record<string, string>) {
    const params = new URLSearchParams(query);
    return new NextRequest(`https://avant.test/api/simulado/questao?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(401);
    expect(mockBuildSimuladoQuestaoPayload).not.toHaveBeenCalled();
  });

  it('retorna 403 quando builder indica forbidden', async () => {
    mockBuildSimuladoQuestaoPayload.mockResolvedValue({ status: 'forbidden' });

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Sem acesso a este módulo' });
  });

  it('retorna 404 quando builder indica not_found', async () => {
    mockBuildSimuladoQuestaoPayload.mockResolvedValue({ status: 'not_found' });

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Questão não encontrada' });
  });

  it('retorna 400 com slug ausente', async () => {
    const response = await GET(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockBuildSimuladoQuestaoPayload).not.toHaveBeenCalled();
  });

  it('retorna 200 com payload slim e Cache-Control private', async () => {
    mockBuildSimuladoQuestaoPayload.mockResolvedValue({
      status: 'ok',
      payload: payloadOk,
    });

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payloadOk);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockBuildSimuladoQuestaoPayload).toHaveBeenCalledWith({
      slug: SLUG,
      userId: USER_ID,
      supabase: expect.any(Object),
      isAdmin: false,
    });
    expect(mockRecordPerformance).toHaveBeenCalledWith(
      '/api/simulado/questao',
      'GET',
      expect.any(Number),
      true,
      'simulado',
    );
  });

  it('retorna 500 quando ocorre erro inesperado no builder', async () => {
    mockBuildSimuladoQuestaoPayload.mockRejectedValue(new Error('boom'));

    const response = await GET(makeRequest({ slug: SLUG }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno' });
  });
});
