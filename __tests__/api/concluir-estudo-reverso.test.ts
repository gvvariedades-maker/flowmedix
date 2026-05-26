/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/concluir-estudo-reverso/route';

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

const mockFrom = jest.fn();
const mockCreateServerSupabase = jest.fn(async () => ({
  from: mockFrom,
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(() => mockCreateServerSupabase()),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-teste-slug';

describe('POST /api/concluir-estudo-reverso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
    });
    mockUserHasModuloAccess.mockResolvedValue(true);
  });

  function makeRequest(body: object) {
    return new NextRequest('https://avant.test/api/concluir-estudo-reverso', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    });
  }

  it('retorna 403 sem entitlement no módulo', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);
    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: 'modulo-uuid' },
      error: null,
    });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });
    mockFrom.mockReturnValue({ select: moduloSelect, eq: moduloEq });

    const response = await POST(makeRequest({ modulo_slug: SLUG }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Sem acesso a esta questão' });
  });

  it('retorna 404 quando o módulo não existe', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);
    const moduloMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });
    mockFrom.mockReturnValue({ select: moduloSelect, eq: moduloEq });

    const response = await POST(makeRequest({ modulo_slug: 'slug-inexistente' }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Questão não encontrada' });
  });

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);
    const response = await POST(makeRequest({ modulo_slug: SLUG }));
    expect(response.status).toBe(401);
  });

  it('atualiza historico existente via service role', async () => {
    const updateEq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: updateEq }) });
    const select = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
      }),
    });

    mockFrom.mockReturnValue({ select, update });

    const response = await POST(makeRequest({ modulo_slug: SLUG }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockCreateServerSupabase).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({ estudo_reverso_concluido: true });
  });

  it('insere historico quando ainda nao ha tentativa', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const select = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      }),
    });

    mockFrom.mockReturnValue({ select, insert });

    const response = await POST(makeRequest({ modulo_slug: SLUG }));

    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        modulo_slug: SLUG,
        estudo_reverso_concluido: true,
      }),
    );
  });
});
