/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockMarkSimuladoProvaIniciada = jest.fn();
const mockLoadSimuladoSessionDetail = jest.fn();

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
  iniciarE2eSimuladoProva: jest.fn(),
}));

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/simulado/startProva', () => ({
  markSimuladoProvaIniciada: (...args: unknown[]) => mockMarkSimuladoProvaIniciada(...args),
}));

jest.mock('@/lib/simulado/sessionDetail', () => ({
  loadSimuladoSessionDetail: (...args: unknown[]) => mockLoadSimuladoSessionDetail(...args),
}));

import { POST } from '@/app/api/simulado/sessions/[id]/iniciar-prova/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';

function makeRequest() {
  return new NextRequest(`https://avant.test/api/simulado/sessions/${SESSION_ID}/iniciar-prova`, {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
  });
}

const detailPayload = {
  session: {
    id: SESSION_ID,
    status: 'aberto' as const,
    modo: 'prova' as const,
    titulo: 'Prova',
    ritmo_meta_segundos_por_questao: 180,
    prova_iniciada_em: '2026-06-01T10:00:00.000Z',
    total_questoes: 20,
    filtros: { modo: 'prova' },
    created_at: '2026-06-01T09:00:00.000Z',
    concluida_em: null,
  },
  resumo: {
    respondidas: 0,
    pendentes: 20,
    acertos: 0,
    erros: 0,
    percentual_acerto: 0,
    tempo_total_ms: 0,
    tempo_medio_ms: 0,
  },
  questoes: [],
};

describe('POST /api/simulado/sessions/[id]/iniciar-prova', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: USER_ID } });
    mockCreateServerSupabase.mockResolvedValue({});
  });

  it('inicia prova e retorna detalhe da sessão', async () => {
    mockMarkSimuladoProvaIniciada.mockResolvedValue({
      ok: true,
      alreadyStarted: false,
      session: {},
    });
    mockLoadSimuladoSessionDetail.mockResolvedValue({ data: detailPayload, error: null });

    const response = await POST(makeRequest(), { params: Promise.resolve({ id: SESSION_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.session.prova_iniciada_em).toBe('2026-06-01T10:00:00.000Z');
    expect(mockMarkSimuladoProvaIniciada).toHaveBeenCalledWith({}, USER_ID, SESSION_ID);
  });

  it('é idempotente quando prova já foi iniciada', async () => {
    mockMarkSimuladoProvaIniciada.mockResolvedValue({
      ok: true,
      alreadyStarted: true,
      session: {},
    });
    mockLoadSimuladoSessionDetail.mockResolvedValue({ data: detailPayload, error: null });

    const response = await POST(makeRequest(), { params: Promise.resolve({ id: SESSION_ID }) });

    expect(response.status).toBe(200);
    expect(mockMarkSimuladoProvaIniciada).toHaveBeenCalledTimes(1);
  });

  it('retorna 400 quando sessão não é modo prova', async () => {
    mockMarkSimuladoProvaIniciada.mockResolvedValue({ ok: false, code: 'invalid_mode' });

    const response = await POST(makeRequest(), { params: Promise.resolve({ id: SESSION_ID }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/modo prova/i);
  });
});
