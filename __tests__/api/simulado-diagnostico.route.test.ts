/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/simulado/diagnostico/route';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockGetUserPreferencesOnboarding = jest.fn();
const mockBuildDiagnosticoQuestionPool = jest.fn();
const mockGetDiagnosticoSimuladoCardState = jest.fn();

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

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/onboarding/preferences', () => ({
  getUserPreferencesOnboarding: (...args: unknown[]) => mockGetUserPreferencesOnboarding(...args),
}));

jest.mock('@/lib/simulado/diagnosticoPool', () => ({
  buildDiagnosticoQuestionPool: (...args: unknown[]) => mockBuildDiagnosticoQuestionPool(...args),
}));

jest.mock('@/lib/simulado/diagnosticoStatus', () => ({
  getDiagnosticoSimuladoCardState: (...args: unknown[]) =>
    mockGetDiagnosticoSimuladoCardState(...args),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(method: 'GET' | 'POST', body?: object) {
  return new NextRequest('https://avant.test/api/simulado/diagnostico', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
  });
}

describe('/api/simulado/diagnostico', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
    });
  });

  it('GET retorna estado do card', async () => {
    mockGetDiagnosticoSimuladoCardState.mockResolvedValue({
      show_card: true,
      onboarding_completed: true,
      diagnostico_completed: false,
      has_open_session: false,
      session: null,
    });

    const response = await GET(makeRequest('GET'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.show_card).toBe(true);
    expect(mockGetDiagnosticoSimuladoCardState).toHaveBeenCalledWith(USER_ID);
  });

  it('POST retorna 403 sem onboarding concluído', async () => {
    mockGetUserPreferencesOnboarding.mockResolvedValue({
      completed: false,
      preferences: null,
    });

    const response = await POST(makeRequest('POST', {}));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/onboarding/i);
  });

  it('POST retoma sessão diagnóstica aberta', async () => {
    mockGetUserPreferencesOnboarding.mockResolvedValue({
      completed: true,
      preferences: {
        topicos_afinidade: ['Fundamentos e Bases'],
        topicos_dificuldade: ['Farmacologia e Medicamentos'],
        bancas_foco: ['CPCON'],
        carga_horaria_semanal: 10,
      },
    });

    const order = jest.fn().mockReturnThis();
    const limit = jest.fn().mockResolvedValue({
      data: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          total_questoes: 18,
          status: 'aberto',
          titulo: 'Simulado Diagnóstico Inicial',
          created_at: '2026-06-18T00:00:00.000Z',
          filtros: { tipo: 'diagnostico_inicial' },
        },
      ],
      error: null,
    });
    const eqUser = jest.fn().mockReturnValue({ order, limit });
    const select = jest.fn().mockReturnValue({ eq: eqUser });
    const from = jest.fn().mockReturnValue({ select });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(makeRequest('POST', {}));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.resumed).toBe(true);
    expect(json.diagnostico).toBe(true);
    expect(json.session.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(mockBuildDiagnosticoQuestionPool).not.toHaveBeenCalled();
  });

  it('POST cria nova sessão diagnóstica', async () => {
    mockGetUserPreferencesOnboarding.mockResolvedValue({
      completed: true,
      preferences: {
        topicos_afinidade: ['Fundamentos e Bases'],
        topicos_dificuldade: ['Farmacologia e Medicamentos'],
        bancas_foco: ['CPCON'],
        carga_horaria_semanal: 10,
      },
    });

    mockBuildDiagnosticoQuestionPool.mockResolvedValue([
      {
        modulo_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        modulo_slug: 'slug-1',
        ordem: 1,
      },
    ]);

    const existingOrder = jest.fn().mockReturnThis();
    const existingLimit = jest.fn().mockResolvedValue({ data: [], error: null });
    const existingEqUser = jest.fn().mockReturnValue({ order: existingOrder, limit: existingLimit });

    const insertSingle = jest.fn().mockResolvedValue({
      data: {
        id: '22222222-2222-4222-8222-222222222222',
        total_questoes: 1,
        status: 'aberto',
        titulo: 'Simulado Diagnóstico Inicial',
        created_at: '2026-06-18T00:00:00.000Z',
        filtros: { tipo: 'diagnostico_inicial' },
        ritmo_meta_segundos_por_questao: null,
        prova_iniciada_em: null,
      },
      error: null,
    });
    const insertSelect = jest.fn().mockReturnValue({ single: insertSingle });
    const insert = jest.fn().mockReturnValue({ select: insertSelect });

    const respostasInsert = jest.fn().mockResolvedValue({ error: null });

    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') {
        return {
          select: jest.fn().mockReturnValue({ eq: existingEqUser }),
          insert,
          delete: jest.fn(),
        };
      }
      if (table === 'simulado_respostas') {
        return { insert: respostasInsert };
      }
      return { select: jest.fn() };
    });

    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(makeRequest('POST', { quantidade: 18 }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.resumed).toBe(false);
    expect(json.diagnostico).toBe(true);
    expect(json.session.id).toBe('22222222-2222-4222-8222-222222222222');
    expect(mockBuildDiagnosticoQuestionPool).toHaveBeenCalled();
    expect(respostasInsert).toHaveBeenCalled();
  });
});
