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

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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
});

