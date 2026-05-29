/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockRevalidateTag = jest.fn();
const mockAssertCanAnswerSimuladoQuestion = jest.fn();

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
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
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

jest.mock('@/lib/freemium', () => ({
  assertCanAnswerSimuladoQuestion: (...args: unknown[]) =>
    mockAssertCanAnswerSimuladoQuestion(...args),
  countSimuladoQuestoesHojeForUser: jest.fn().mockResolvedValue(0),
  FREEMIUM_SIMULADO_DAILY_LIMIT: 5,
  getFreemiumDayBounds: jest.fn(() => ({
    resetEm: new Date('2026-05-30T03:00:00.000Z'),
  })),
  isFreemiumUnlimitedEmail: jest.fn(() => false),
  isUserPro: jest.fn().mockResolvedValue(false),
}));

import { POST } from '@/app/api/simulado/responder/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';

function makeRequest(body: object) {
  return new NextRequest('https://avant.test/api/simulado/responder', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
  });
}

function buildRespostaProgressRows() {
  return [
    {
      ordem: 1,
      modulo_slug: 'questao-slug',
      opcao_id: 'B',
      opcao_correta_id: 'B',
      acertou: true,
      respondida_em: '2026-05-27T12:00:00.000Z',
      tempo_ms: 45000,
      modulos_estudo: {
        banca: 'FGV',
        modulo_nome: 'Urgências',
        titulo_aula: 'RCP',
      },
    },
    {
      ordem: 2,
      modulo_slug: 'questao-2',
      opcao_id: null,
      opcao_correta_id: null,
      acertou: null,
      respondida_em: null,
      tempo_ms: null,
      modulos_estudo: {
        banca: 'FGV',
        modulo_nome: 'Urgências',
        titulo_aula: 'AVC',
      },
    },
    {
      ordem: 3,
      modulo_slug: 'questao-3',
      opcao_id: null,
      opcao_correta_id: null,
      acertou: null,
      respondida_em: null,
      tempo_ms: null,
      modulos_estudo: null,
    },
  ];
}

describe('POST /api/simulado/responder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'free@test.com' },
    });
    mockAssertCanAnswerSimuladoQuestion.mockResolvedValue({ allowed: true });
  });

  it('sincroniza tentativa no histórico e retorna questao_atualizada + resumo', async () => {
    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: SESSION_ID,
        status: 'aberto',
        user_id: USER_ID,
        filtros: { modo: 'treino' },
        total_questoes: 3,
      },
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
        ordem: 1,
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

    const progressOrder = jest.fn().mockResolvedValue({
      data: buildRespostaProgressRows(),
      error: null,
    });
    const progressEqUser = jest.fn().mockReturnValue({ order: progressOrder });
    const progressEqSession = jest.fn().mockReturnValue({ eq: progressEqUser });
    const progressSelect = jest.fn().mockReturnValue({ eq: progressEqSession });

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
        const select = (...args: unknown[]) => {
          const query = String(args[0] ?? '');
          if (args.length > 1) return respostaCountSelect();
          if (query.includes('modulos_estudo')) return progressSelect();
          return respostaSelect();
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
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      acertou: true,
      opcao_correta_id: 'B',
      session_status: 'aberto',
      questao_atualizada: {
        ordem: 1,
        modulo_slug: 'questao-slug',
        respondida: true,
        meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
        acertou: true,
        opcao_id: 'B',
        opcao_correta_id: 'B',
        respondida_em: '2026-05-27T12:00:00.000Z',
        tempo_ms: 45000,
      },
      resumo: {
        respondidas: 1,
        pendentes: 2,
        acertos: 1,
        erros: 0,
        percentual_acerto: 100,
        tempo_total_ms: 45000,
        tempo_medio_ms: 45000,
      },
    });
    expect(historicoInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        modulo_slug: 'questao-slug',
        acertou: true,
        banca: 'FGV',
      }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('historico', { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith(`user-${USER_ID}`, { expire: 0 });
  });

  it('em modo prova oculta gabarito em questao_atualizada enquanto sessão aberta', async () => {
    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: SESSION_ID,
        status: 'aberto',
        user_id: USER_ID,
        filtros: { modo: 'prova' },
        total_questoes: 2,
      },
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
        ordem: 1,
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

    const respostaCountIs = jest.fn().mockResolvedValue({ count: 1, error: null });
    const respostaCountEqUser = jest.fn().mockReturnValue({ is: respostaCountIs });
    const respostaCountEqSession = jest.fn().mockReturnValue({ eq: respostaCountEqUser });
    const respostaCountSelect = jest.fn().mockReturnValue({ eq: respostaCountEqSession });

    const progressOrder = jest.fn().mockResolvedValue({
      data: [
        {
          ordem: 1,
          modulo_slug: 'questao-slug',
          opcao_id: 'B',
          opcao_correta_id: 'B',
          acertou: true,
          respondida_em: '2026-05-27T12:00:00.000Z',
          tempo_ms: 30000,
          modulos_estudo: { banca: 'FGV', modulo_nome: 'Urgências', titulo_aula: 'RCP' },
        },
        {
          ordem: 2,
          modulo_slug: 'questao-2',
          opcao_id: null,
          opcao_correta_id: null,
          acertou: null,
          respondida_em: null,
          tempo_ms: null,
          modulos_estudo: null,
        },
      ],
      error: null,
    });
    const progressEqUser = jest.fn().mockReturnValue({ order: progressOrder });
    const progressEqSession = jest.fn().mockReturnValue({ eq: progressEqUser });
    const progressSelect = jest.fn().mockReturnValue({ eq: progressEqSession });

    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        conteudo_json: {
          question_data: {
            options: [
              { id: 'A', is_correct: false },
              { id: 'B', is_correct: true },
            ],
          },
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
        const select = (...args: unknown[]) => {
          const query = String(args[0] ?? '');
          if (args.length > 1) return respostaCountSelect();
          if (query.includes('modulos_estudo')) return progressSelect();
          return respostaSelect();
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
    const body = await response.json();
    expect(body.acertou).toBeNull();
    expect(body.opcao_correta_id).toBeNull();
    expect(body.questao_atualizada).toMatchObject({
      respondida: true,
      acertou: false,
      opcao_correta_id: null,
      opcao_id: 'B',
    });
  });

  it('retorna 409 quando a questão já foi respondida na sessão', async () => {
    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: SESSION_ID,
        status: 'aberto',
        user_id: USER_ID,
        filtros: { modo: 'prova' },
        total_questoes: 1,
      },
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
        ordem: 1,
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
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('retorna 403 quando limite diário de simulado foi atingido', async () => {
    mockAssertCanAnswerSimuladoQuestion.mockResolvedValue({
      allowed: false,
      resetEm: '2026-05-30T03:00:00.000Z',
    });

    const sessionMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: SESSION_ID,
        status: 'aberto',
        user_id: USER_ID,
        filtros: { modo: 'treino' },
        total_questoes: 1,
      },
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
        ordem: 1,
        acertou: null,
      },
      error: null,
    });
    const respostaEqUser = jest.fn().mockReturnValue({ maybeSingle: respostaMaybeSingle });
    const respostaEqSlug = jest.fn().mockReturnValue({ eq: respostaEqUser });
    const respostaEqSession = jest.fn().mockReturnValue({ eq: respostaEqSlug });
    const respostaSelect = jest.fn().mockReturnValue({ eq: respostaEqSession });

    const from = jest.fn().mockImplementation((table: string) => {
      if (table === 'simulado_sessions') return { select: sessionSelect };
      if (table === 'simulado_respostas') return { select: respostaSelect };
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

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        limiteAtingido: true,
        allowed: false,
        limite: 5,
        resetEm: '2026-05-30T03:00:00.000Z',
      }),
    );
  });
});
