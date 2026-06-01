/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/simulado/sessions/route';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockFetchSimuladoQuestionPoolFromRpc = jest.fn();
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

jest.mock('@/lib/e2e/simuladoSeed', () => ({
  createE2eSimuladoSession: jest.fn(),
  resetE2eSimuladoStore: jest.fn(),
}));

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/simulado/rpc', () => ({
  fetchSimuladoQuestionPoolFromRpc: (...args: unknown[]) => mockFetchSimuladoQuestionPoolFromRpc(...args),
}));

const mockGetSimuladoTemplateById = jest.fn();
const mockTouchSimuladoTemplateUsage = jest.fn();

jest.mock('@/lib/simulado/templates', () => ({
  getSimuladoTemplateById: (...args: unknown[]) => mockGetSimuladoTemplateById(...args),
  templateToSessionConfig: jest.requireActual('@/lib/simulado/templates').templateToSessionConfig,
  touchSimuladoTemplateUsage: (...args: unknown[]) => mockTouchSimuladoTemplateUsage(...args),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEMPLATE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function makeRequest(method: 'GET' | 'POST', body?: object) {
  return new NextRequest('https://avant.test/api/simulado/sessions', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
  });
}

describe('/api/simulado/sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: USER_ID } });
    mockGetSimuladoTemplateById.mockResolvedValue(null);
    mockTouchSimuladoTemplateUsage.mockResolvedValue(undefined);
  });

  it('GET retorna sessão aberta quando existir', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        total_questoes: 20,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
        filtros: { requested: 20 },
      },
      error: null,
    });
    const limit = jest.fn().mockReturnValue({ maybeSingle });
    const order = jest.fn().mockReturnValue({ limit });
    const eqStatus = jest.fn().mockReturnValue({ order });
    const eqUser = jest.fn().mockReturnValue({ eq: eqStatus });
    const select = jest.fn().mockReturnValue({ eq: eqUser });
    const from = jest.fn().mockReturnValue({ select });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await GET(makeRequest('GET'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      has_open_session: true,
      session: expect.objectContaining({
        id: '11111111-1111-4111-8111-111111111111',
        status: 'aberto',
      }),
    });
  });

  it('POST retorna resumed=true quando já existe sessão aberta e não força nova', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '22222222-2222-4222-8222-222222222222',
        total_questoes: 12,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
      },
      error: null,
    });
    const limit = jest.fn().mockReturnValue({ maybeSingle });
    const order = jest.fn().mockReturnValue({ limit });
    const eqStatus = jest.fn().mockReturnValue({ order });
    const eqUser = jest.fn().mockReturnValue({ eq: eqStatus });
    const select = jest.fn().mockReturnValue({ eq: eqUser });
    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') return { select };
      return { select };
    });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(makeRequest('POST', { quantidade: 20 }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      resumed: true,
      session: expect.objectContaining({
        id: '22222222-2222-4222-8222-222222222222',
        status: 'aberto',
      }),
      questoes: [],
    });
    expect(mockFetchSimuladoQuestionPoolFromRpc).not.toHaveBeenCalled();
  });

  it('POST em modo prova persiste titulo e ritmo_meta_segundos_por_questao', async () => {
    const pool = [
      { modulo_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', modulo_slug: 'q1', ordem: 1 },
    ];
    mockFetchSimuladoQuestionPoolFromRpc.mockResolvedValue(pool);

    const maybeSingleOpen = jest.fn().mockResolvedValue({ data: null, error: null });
    const limitOpen = jest.fn().mockReturnValue({ maybeSingle: maybeSingleOpen });
    const orderOpen = jest.fn().mockReturnValue({ limit: limitOpen });
    const eqStatusOpen = jest.fn().mockReturnValue({ order: orderOpen });
    const eqUserOpen = jest.fn().mockReturnValue({ eq: eqStatusOpen });

    const createdSession = {
      id: '33333333-3333-4333-8333-333333333333',
      total_questoes: 1,
      status: 'aberto',
      created_at: '2026-06-01T00:00:00.000Z',
      filtros: { modo: 'prova' },
      titulo: 'Prova IBFC',
      ritmo_meta_segundos_por_questao: 120,
      prova_iniciada_em: null,
    };

    const single = jest.fn().mockResolvedValue({ data: createdSession, error: null });
    const selectAfterInsert = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select: selectAfterInsert });
    const insertRespostas = jest.fn().mockResolvedValue({ error: null });

    const selectOpen = jest.fn().mockReturnValue({ eq: eqUserOpen });
    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') {
        return { select: selectOpen, insert };
      }
      if (table === 'simulado_respostas') {
        return { insert: insertRespostas };
      }
      return { select: selectOpen };
    });

    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest('POST', {
        quantidade: 1,
        modo: 'prova',
        titulo: 'Prova IBFC',
        ritmo_meta: '2min',
        forcar_novo: true,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Prova IBFC',
        ritmo_meta_segundos_por_questao: 120,
        prova_iniciada_em: null,
        modo: 'prova',
      }),
    );
    expect(json.session).toEqual(
      expect.objectContaining({
        titulo: 'Prova IBFC',
        ritmo_meta_segundos_por_questao: 120,
        modo: 'prova',
      }),
    );
  });

  it('POST em modo treino ignora ritmo_meta e deixa ritmo nulo', async () => {
    const pool = [
      { modulo_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', modulo_slug: 'q1', ordem: 1 },
    ];
    mockFetchSimuladoQuestionPoolFromRpc.mockResolvedValue(pool);

    const maybeSingleOpen = jest.fn().mockResolvedValue({ data: null, error: null });
    const limitOpen = jest.fn().mockReturnValue({ maybeSingle: maybeSingleOpen });
    const orderOpen = jest.fn().mockReturnValue({ limit: limitOpen });
    const eqStatusOpen = jest.fn().mockReturnValue({ order: orderOpen });
    const eqUserOpen = jest.fn().mockReturnValue({ eq: eqStatusOpen });

    const single = jest.fn().mockResolvedValue({
      data: {
        id: '44444444-4444-4444-8444-444444444444',
        total_questoes: 1,
        status: 'aberto',
        created_at: '2026-06-01T00:00:00.000Z',
        filtros: { modo: 'treino' },
        titulo: 'Treino · 1 questão · 01/06/2026',
        ritmo_meta_segundos_por_questao: null,
        prova_iniciada_em: null,
      },
      error: null,
    });
    const selectAfterInsert = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select: selectAfterInsert });
    const insertRespostas = jest.fn().mockResolvedValue({ error: null });

    const selectOpen = jest.fn().mockReturnValue({ eq: eqUserOpen });
    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') {
        return { select: selectOpen, insert };
      }
      if (table === 'simulado_respostas') {
        return { insert: insertRespostas };
      }
      return { select: selectOpen };
    });

    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest('POST', {
        quantidade: 1,
        modo: 'treino',
        ritmo_meta: '2min',
        forcar_novo: true,
      }),
    );

    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ritmo_meta_segundos_por_questao: null,
        modo: 'treino',
      }),
    );
  });

  it('POST com template_id copia configuração do template e atualiza ultimo_uso', async () => {
    mockGetSimuladoTemplateById.mockResolvedValue({
      id: TEMPLATE_ID,
      titulo: 'Prova salva IBFC',
      modo: 'prova',
      quantidade: 2,
      filtros: { bancas: ['IBFC'], assuntos: null, q: null },
      ritmo_meta: '3min',
      ritmo_meta_segundos_por_questao: 180,
      ultimo_uso_em: null,
      created_at: '2026-06-01T00:00:00.000Z',
    });

    const pool = [
      { modulo_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', modulo_slug: 'q1', ordem: 1 },
      { modulo_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', modulo_slug: 'q2', ordem: 2 },
    ];
    mockFetchSimuladoQuestionPoolFromRpc.mockResolvedValue(pool);

    const maybeSingleOpen = jest.fn().mockResolvedValue({ data: null, error: null });
    const limitOpen = jest.fn().mockReturnValue({ maybeSingle: maybeSingleOpen });
    const orderOpen = jest.fn().mockReturnValue({ limit: limitOpen });
    const eqStatusOpen = jest.fn().mockReturnValue({ order: orderOpen });
    const eqUserOpen = jest.fn().mockReturnValue({ eq: eqStatusOpen });

    const createdSession = {
      id: '55555555-5555-4555-8555-555555555555',
      total_questoes: 2,
      status: 'aberto',
      created_at: '2026-06-01T00:00:00.000Z',
      filtros: { modo: 'prova', bancas: ['IBFC'] },
      titulo: 'Prova salva IBFC',
      ritmo_meta_segundos_por_questao: 180,
      prova_iniciada_em: null,
    };

    const single = jest.fn().mockResolvedValue({ data: createdSession, error: null });
    const selectAfterInsert = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select: selectAfterInsert });
    const insertRespostas = jest.fn().mockResolvedValue({ error: null });

    const selectOpen = jest.fn().mockReturnValue({ eq: eqUserOpen });
    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') {
        return { select: selectOpen, insert };
      }
      if (table === 'simulado_respostas') {
        return { insert: insertRespostas };
      }
      return { select: selectOpen };
    });

    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest('POST', {
        template_id: TEMPLATE_ID,
        forcar_novo: true,
        quantidade: 99,
        modo: 'treino',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetSimuladoTemplateById).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID,
      TEMPLATE_ID,
    );
    expect(mockFetchSimuladoQuestionPoolFromRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        quantidade: 2,
        filters: expect.objectContaining({ bancas: ['IBFC'] }),
      }),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Prova salva IBFC',
        ritmo_meta_segundos_por_questao: 180,
        template_id: TEMPLATE_ID,
        modo: 'prova',
      }),
    );
    expect(mockTouchSimuladoTemplateUsage).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID,
      TEMPLATE_ID,
    );
    expect(json.session).toEqual(
      expect.objectContaining({
        titulo: 'Prova salva IBFC',
        modo: 'prova',
      }),
    );
  });

  it('POST com template_id inexistente retorna 404', async () => {
    mockGetSimuladoTemplateById.mockResolvedValue(null);

    const maybeSingleOpen = jest.fn().mockResolvedValue({ data: null, error: null });
    const limitOpen = jest.fn().mockReturnValue({ maybeSingle: maybeSingleOpen });
    const orderOpen = jest.fn().mockReturnValue({ limit: limitOpen });
    const eqStatusOpen = jest.fn().mockReturnValue({ order: orderOpen });
    const eqUserOpen = jest.fn().mockReturnValue({ eq: eqStatusOpen });
    const selectOpen = jest.fn().mockReturnValue({ eq: eqUserOpen });
    const from = jest.fn().mockReturnValue({ select: selectOpen });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest('POST', {
        template_id: TEMPLATE_ID,
        forcar_novo: true,
      }),
    );

    expect(response.status).toBe(404);
    expect(mockFetchSimuladoQuestionPoolFromRpc).not.toHaveBeenCalled();
  });
});

