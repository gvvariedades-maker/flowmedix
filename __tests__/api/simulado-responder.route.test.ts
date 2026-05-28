/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { POST } from '@/app/api/simulado/responder/route';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();

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
  answerE2eSimuladoQuestion: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  CACHE_REVALIDATE_IMMEDIATE: { expire: 0 },
}));

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';

function makeRequest(body: object) {
  return new NextRequest('https://avant.test/api/simulado/responder', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
  });
}

describe('POST /api/simulado/responder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: USER_ID } });
  });

  it('sincroniza tentativa no histórico e invalida cache analytics/histórico', async () => {
    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: SESSION_ID, status: 'aberto', user_id: USER_ID, modo: 'treino' },
      error: null,
    });
    const sessionEqId = jest.fn().mockReturnValue({ maybeSingle: sessionMaybeSingle });
    const sessionSelect = jest.fn().mockReturnValue({ eq: sessionEqId });

    const respostaMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '44444444-4444-4444-8444-444444444444',
        session_id: SESSION_ID,
        modulo_id: '55555555-5555-4555-8555-555555555555',
        modulo_slug: 'questao-slug',
        acertou: null,
      },
      error: null,
    });
    const respostaEqUser = jest.fn().mockReturnValue({ maybeSingle: respostaMaybeSingle });
    const respostaEqSlug = jest.fn().mockReturnValue({ eq: respostaEqUser });
    const respostaEqSession = jest.fn().mockReturnValue({ eq: respostaEqSlug });
    const respostaSelect = jest.fn().mockReturnValue({ eq: respostaEqSession });

    const respostaUpdateMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: '44444444-4444-4444-8444-444444444444' },
      error: null,
    });
    const respostaUpdateSelect = jest.fn().mockReturnValue({ maybeSingle: respostaUpdateMaybeSingle });
    const respostaUpdateEqSession = jest.fn().mockReturnValue({ select: respostaUpdateSelect });
    const respostaUpdateEqId = jest.fn().mockReturnValue({ eq: respostaUpdateEqSession });
    const respostaUpdate = jest.fn().mockReturnValue({ eq: respostaUpdateEqId });

    const respostaCountIs = jest.fn().mockResolvedValue({ count: 2, error: null });
    const respostaCountEqUser = jest.fn().mockReturnValue({ is: respostaCountIs });
    const respostaCountEqSession = jest.fn().mockReturnValue({ eq: respostaCountEqUser });
    const respostaCountSelect = jest.fn().mockReturnValue({ eq: respostaCountEqSession });

    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        conteudo_json: {
          question_data: {
            options: [
              { id: 'A', is_correct: false },
              { id: 'B', is_correct: true },
            ],
          },
          meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
        },
        banca: 'FGV',
        modulo_nome: 'Urgências',
        titulo_aula: 'RCP',
      },
      error: null,
    });
    const moduloEqId = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEqId });

    const historicoMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const historicoLimit = jest.fn().mockReturnValue({ maybeSingle: historicoMaybeSingle });
    const historicoOrder = jest.fn().mockReturnValue({ limit: historicoLimit });
    const historicoEqSlug = jest.fn().mockReturnValue({ order: historicoOrder });
    const historicoEqUser = jest.fn().mockReturnValue({ eq: historicoEqSlug });
    const historicoSelect = jest.fn().mockReturnValue({ eq: historicoEqUser });
    const historicoInsert = jest.fn().mockResolvedValue({ error: null });

    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') return { select: sessionSelect };
      if (table === 'simulado_respostas') {
        let selectCallCount = 0;
        const select = (...args: unknown[]) => {
          selectCallCount += 1;
          return args.length > 1 ? respostaCountSelect() : respostaSelect();
        };
        return { select, update: respostaUpdate };
      }
      if (table === 'modulos_estudo') return { select: moduloSelect };
      if (table === 'historico_questoes') return { select: historicoSelect, insert: historicoInsert };
      return { select: jest.fn() };
    });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest({
        session_id: SESSION_ID,
        modulo_slug: 'questao-slug',
        opcao_id: 'B',
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      acertou: true,
      opcao_correta_id: 'B',
      session_status: 'aberto',
    });
    expect(historicoInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        modulo_slug: 'questao-slug',
        acertou: true,
        banca: 'FGV',
      }),
    );
    expect(revalidateTag).toHaveBeenCalledWith('historico', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith(`user-${USER_ID}`, { expire: 0 });
  });

  it('retorna 409 quando a questão já foi respondida na sessão', async () => {
    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: SESSION_ID, status: 'aberto', user_id: USER_ID, modo: 'prova' },
      error: null,
    });
    const sessionEqId = jest.fn().mockReturnValue({ maybeSingle: sessionMaybeSingle });
    const sessionSelect = jest.fn().mockReturnValue({ eq: sessionEqId });

    const respostaMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '44444444-4444-4444-8444-444444444444',
        session_id: SESSION_ID,
        modulo_id: '55555555-5555-4555-8555-555555555555',
        modulo_slug: 'questao-slug',
        acertou: true,
      },
      error: null,
    });
    const respostaEqUser = jest.fn().mockReturnValue({ maybeSingle: respostaMaybeSingle });
    const respostaEqSlug = jest.fn().mockReturnValue({ eq: respostaEqUser });
    const respostaEqSession = jest.fn().mockReturnValue({ eq: respostaEqSlug });
    const respostaSelect = jest.fn().mockReturnValue({ eq: respostaEqSession });

    const historicoInsert = jest.fn();

    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') return { select: sessionSelect };
      if (table === 'simulado_respostas') return { select: respostaSelect, update: jest.fn() };
      if (table === 'historico_questoes') return { insert: historicoInsert };
      return { select: jest.fn() };
    });
    mockCreateServerSupabase.mockResolvedValue({ from });

    const response = await POST(
      makeRequest({
        session_id: SESSION_ID,
        modulo_slug: 'questao-slug',
        opcao_id: 'B',
      }),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'Questão já respondida para esta sessão',
    });
    expect(historicoInsert).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

