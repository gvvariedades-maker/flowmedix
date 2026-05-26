/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/registrar-tentativa/route';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  CACHE_REVALIDATE_IMMEDIATE: { expire: 0 },
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockUserHasModuloAccess = jest.fn();
jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn((...args: unknown[]) => mockUserHasModuloAccess(...args)),
}));

jest.mock('@/lib/freemium', () => ({
  assertCanAnswerQuestion: jest.fn().mockResolvedValue({ allowed: true }),
  countQuestoesHojeForUser: jest.fn().mockResolvedValue(0),
  getFreemiumDayBounds: jest.fn().mockReturnValue({ resetEm: new Date('2026-05-27T03:00:00Z') }),
  isFreemiumUnlimitedEmail: jest.fn().mockReturnValue(true),
  isUserPro: jest.fn().mockResolvedValue(false),
}));

const mockFrom = jest.fn();
const mockCreateServerSupabase = jest.fn(async () => ({
  from: mockFrom,
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(() => mockCreateServerSupabase()),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-teste-slug';

const conteudoJson = {
  question_data: {
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
    ],
  },
};

describe('POST /api/registrar-tentativa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
    });
    mockUserHasModuloAccess.mockResolvedValue(true);
  });

  function makeRequest(body: object) {
    return new NextRequest('https://avant.test/api/registrar-tentativa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    });
  }

  function mockModuloFetch(options?: { historicoExistenteId?: string }) {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: { conteudo_json: conteudoJson },
      error: null,
    });
    const historicoMaybeSingle = jest.fn().mockResolvedValue({
      data: options?.historicoExistenteId ? { id: options.historicoExistenteId } : null,
      error: null,
    });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const historicoLimit = jest.fn().mockReturnValue({ maybeSingle: historicoMaybeSingle });
    const historicoOrder = jest.fn().mockReturnValue({ limit: historicoLimit });
    const historicoEqModulo = jest.fn().mockReturnValue({ order: historicoOrder });
    const historicoEqUser = jest.fn().mockReturnValue({ eq: historicoEqModulo });
    const historicoSelect = jest.fn().mockReturnValue({ eq: historicoEqUser });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'modulos_estudo') return { select: moduloSelect, eq: moduloEq };
      if (table === 'historico_questoes') {
        return { select: historicoSelect, insert, update };
      }
      return { select: moduloSelect, eq: moduloEq, insert, update };
    });

    return { insert, update, moduloMaybeSingle, historicoMaybeSingle };
  }

  it('retorna 403 sem entitlement no módulo', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);
    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: 'modulo-uuid' },
      error: null,
    });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'modulos_estudo') return { select: moduloSelect, eq: moduloEq };
      return { select: moduloSelect, eq: moduloEq };
    });

    const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'B' }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Sem acesso a esta questão' });
  });

  it('retorna 404 quando o módulo não existe', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);
    const moduloMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'modulos_estudo') return { select: moduloSelect, eq: moduloEq };
      return { select: moduloSelect, eq: moduloEq };
    });

    const response = await POST(makeRequest({ modulo_slug: 'slug-inexistente', opcao_id: 'B' }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Questão não encontrada' });
  });

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);
    const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'B' }));
    expect(response.status).toBe(401);
  });

  it('retorna 400 sem opcao_id', async () => {
    const response = await POST(makeRequest({ modulo_slug: SLUG }));
    expect(response.status).toBe(400);
  });

  it('calcula gabarito no servidor e devolve acertou + opcao_correta_id', async () => {
    const { insert } = mockModuloFetch();

    const response = await POST(
      makeRequest({ modulo_slug: SLUG, opcao_id: 'B', banca: 'FGV', topico: 'Fundamentos' }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      acertou: true,
      opcao_correta_id: 'B',
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        modulo_slug: SLUG,
        acertou: true,
      }),
    );
  });

  it('retorna acertou false quando a opção escolhida está errada', async () => {
    mockModuloFetch();

    const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'A' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      acertou: false,
      opcao_correta_id: 'B',
    });
  });

  it('retorna 400 para opcao_id inválida', async () => {
    mockModuloFetch();

    const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'Z' }));

    expect(response.status).toBe(400);
  });

  it('atualiza histórico existente em replay (sem segundo insert)', async () => {
    const HISTORICO_ID = '11111111-1111-4111-8111-111111111111';
    const { insert, update } = mockModuloFetch({ historicoExistenteId: HISTORICO_ID });

    const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'A' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      acertou: false,
      opcao_correta_id: 'B',
    });
    expect(insert).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        acertou: false,
        banca: 'DESCONHECIDA',
      }),
    );
  });
});
