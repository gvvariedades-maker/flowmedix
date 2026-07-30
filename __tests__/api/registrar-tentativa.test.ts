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

const mockAssertCanAnswerQuestion = jest.fn().mockResolvedValue({ allowed: true });
const mockCountQuestoesHojeForUser = jest.fn().mockResolvedValue(0);
const mockIsFreemiumUnlimitedEmail = jest.fn().mockReturnValue(true);
const mockIsUserPro = jest.fn().mockResolvedValue(false);
jest.mock('@/lib/freemium', () => ({
  assertCanAnswerQuestion: jest.fn((...args: unknown[]) => mockAssertCanAnswerQuestion(...args)),
  countQuestoesHojeForUser: jest.fn((...args: unknown[]) => mockCountQuestoesHojeForUser(...args)),
  getFreemiumDayBounds: jest.fn().mockReturnValue({ resetEm: new Date('2026-05-27T03:00:00Z') }),
  isFreemiumUnlimitedEmail: jest.fn((...args: unknown[]) => mockIsFreemiumUnlimitedEmail(...args)),
  isUserPro: jest.fn((...args: unknown[]) => mockIsUserPro(...args)),
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT: 5,
}));

const mockFrom = jest.fn();
const mockCreateServerSupabase = jest.fn(async () => ({
  from: mockFrom,
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(() => mockCreateServerSupabase()),
}));

const mockIsEvidenceV1InstrumentationEnabled = jest.fn();
const mockIsFsrsMvpEnabled = jest.fn();
const mockIsFsrsMvpBetaEmail = jest.fn();
const mockGetFsrsRequestRetention = jest.fn(() => 0.9);
jest.mock('@/lib/env', () => ({
  isEvidenceV1InstrumentationEnabled: jest.fn(() => mockIsEvidenceV1InstrumentationEnabled()),
  isFsrsMvpEnabled: jest.fn(() => mockIsFsrsMvpEnabled()),
  isFsrsMvpBetaEmail: jest.fn((...args: unknown[]) => mockIsFsrsMvpBetaEmail(...args)),
  getFsrsRequestRetention: jest.fn(() => mockGetFsrsRequestRetention()),
}));

const mockIngestAttemptEvent = jest.fn();
jest.mock('@/lib/evidence/ingestAttemptEvent', () => ({
  ingestAttemptEvent: jest.fn((...args: unknown[]) => mockIngestAttemptEvent(...args)),
}));

const mockCreateSupabaseEvidencePersistence = jest.fn();
jest.mock('@/lib/evidence/supabasePersistence', () => ({
  createSupabaseEvidencePersistence: jest.fn((...args: unknown[]) =>
    mockCreateSupabaseEvidencePersistence(...args),
  ),
}));

const mockFsrsPersistReview = jest.fn();
const mockFsrsLoadCard = jest.fn();
const mockCreateSupabaseFsrsPersistence = jest.fn((..._args: unknown[]) => ({
  persistReview: mockFsrsPersistReview,
  loadCard: mockFsrsLoadCard,
}));
jest.mock('@/lib/fsrs/supabasePersistence', () => ({
  createSupabaseFsrsPersistence: jest.fn((...args: unknown[]) =>
    mockCreateSupabaseFsrsPersistence(...args),
  ),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const ATTEMPT_ID = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
const SLUG = 'questao-teste-slug';

const conteudoJson = {
  meta: {
    banca: 'FGV',
    topico: 'Enfermagem',
    subtopico: 'Imunização',
  },
  question_data: {
    instruction: 'Qual alternativa está correta?',
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
    mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(false);
    mockIsFsrsMvpEnabled.mockReturnValue(false);
    mockIsFsrsMvpBetaEmail.mockReturnValue(false);
    mockGetFsrsRequestRetention.mockReturnValue(0.9);
    mockAssertCanAnswerQuestion.mockResolvedValue({ allowed: true });
    mockCountQuestoesHojeForUser.mockResolvedValue(0);
    mockIsFreemiumUnlimitedEmail.mockReturnValue(true);
    mockIsUserPro.mockResolvedValue(false);
    mockCreateSupabaseEvidencePersistence.mockReturnValue({ findAttemptById: jest.fn(), insertAttempt: jest.fn() });
    mockIngestAttemptEvent.mockResolvedValue({ status: 'disabled' });
    mockFsrsLoadCard.mockResolvedValue({ ok: true, card: null });
    mockFsrsPersistReview.mockResolvedValue({
      outcome: 'created',
      writeStatus: 'committed',
      attemptId: ATTEMPT_ID,
      resultingRevision: 1,
    });
    mockCreateSupabaseFsrsPersistence.mockReturnValue({
      persistReview: mockFsrsPersistReview,
      loadCard: mockFsrsLoadCard,
    });
  });

  function makeRequest(body: object) {
    return new NextRequest('https://avant.test/api/registrar-tentativa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    });
  }

  function mockModuloFetch(options?: {
    historicoExistenteId?: string;
    persistError?: boolean;
    conteudoJson?: typeof conteudoJson | Record<string, unknown>;
    dueCard?: {
      review_unit_id: string;
      review_unit_kind: string;
      due_at: string;
      last_question_id: string | null;
      revision: number;
    } | null;
    dueCardError?: { message?: string };
  }) {
    const insert = jest
      .fn()
      .mockResolvedValue({ error: options?.persistError ? { message: 'db fail' } : null });
    const updateEq = jest
      .fn()
      .mockResolvedValue({ error: options?.persistError ? { message: 'db fail' } : null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: { conteudo_json: options?.conteudoJson ?? conteudoJson },
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

    const dueMaybeSingle = jest.fn().mockResolvedValue({
      data: options?.dueCard === undefined ? null : options.dueCard,
      error: options?.dueCardError ?? null,
    });
    const dueEqUnit = jest.fn().mockReturnValue({ maybeSingle: dueMaybeSingle });
    const dueEqUser = jest.fn().mockReturnValue({ eq: dueEqUnit });
    const dueSelect = jest.fn().mockReturnValue({ eq: dueEqUser });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'modulos_estudo') return { select: moduloSelect, eq: moduloEq };
      if (table === 'historico_questoes') {
        return { select: historicoSelect, insert, update };
      }
      if (table === 'spaced_review_cards') {
        return { select: dueSelect };
      }
      return { select: moduloSelect, eq: moduloEq, insert, update };
    });

    return {
      insert,
      update,
      updateEq,
      moduloMaybeSingle,
      historicoMaybeSingle,
      dueMaybeSingle,
    };
  }

  describe('fluxo legado', () => {
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
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
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
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
    });

    it('retorna 401 sem auth', async () => {
      mockGetUserAndClientFromBearer.mockResolvedValue(null);
      const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'B' }));
      expect(response.status).toBe(401);
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
    });

    it('retorna 400 sem opcao_id', async () => {
      const response = await POST(makeRequest({ modulo_slug: SLUG }));
      expect(response.status).toBe(400);
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
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
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
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
          banca: 'FGV',
          created_at: expect.any(String),
        }),
      );
    });

    it('não chama Evidence quando histórico falha ao persistir', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch({ persistError: true });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(500);
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
      expect(mockCreateSupabaseEvidencePersistence).not.toHaveBeenCalled();
    });

    it('campos EE inválidos não geram 400 legado', async () => {
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: 'not-a-uuid',
          conviction: 'invalid_enum',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
    });
  });

  describe('Evidence Engine (Lote 5)', () => {
    it('flag off preserva resposta legada sem evidence e sem adapter', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(false);
      mockModuloFetch();

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockCreateSupabaseEvidencePersistence).not.toHaveBeenCalled();
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
    });

    it('executa Evidence somente após histórico persistir', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      const order: string[] = [];
      const { insert } = mockModuloFetch();
      insert.mockImplementation(async () => {
        order.push('historico');
        return { error: null };
      });
      mockIngestAttemptEvent.mockImplementation(async () => {
        order.push('evidence');
        return { status: 'created', attempt_id: ATTEMPT_ID };
      });

      await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
        }),
      );

      expect(order).toEqual(['historico', 'evidence']);
    });

    it('created → hint evidence com created true', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'created', attempt_id: ATTEMPT_ID });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
        evidence: { attempt_id: ATTEMPT_ID, created: true },
      });
    });

    it('duplicate → hint evidence com created false', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'duplicate', attempt_id: ATTEMPT_ID });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
        evidence: { attempt_id: ATTEMPT_ID, created: false },
      });
    });

    it('D5: conflict → HTTP 200 + hint skipped conflict', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'conflict', attempt_id: ATTEMPT_ID });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
        evidence: { skipped: true, reason: 'conflict' },
      });
    });

    it('missing attempt_id → sem campo evidence', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'skipped', reason: 'missing_attempt_id' });

      const response = await POST(makeRequest({ modulo_slug: SLUG, opcao_id: 'B' }));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(json.evidence).toBeUndefined();
    });

    it('invalid attempt_id → soft-skip com reason no hint', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'skipped', reason: 'invalid_attempt_id' });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: 'bad-id' }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
        evidence: { skipped: true, reason: 'invalid_attempt_id' },
      });
    });

    it('invalid conviction → soft-skip invalid_client_fields', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({
        status: 'skipped',
        reason: 'invalid_client_fields',
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          conviction: 'bad',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        evidence: { skipped: true, reason: 'invalid_client_fields' },
      });
    });

    it('question_version_failed → soft-skip', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({
        status: 'skipped',
        reason: 'question_version_failed',
        attempt_id: ATTEMPT_ID,
      });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        evidence: { skipped: true, reason: 'question_version_failed' },
      });
    });

    it('persistence_failed → hint não bloqueante', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({
        status: 'persistence_failed',
        phase: 'insert',
        attempt_id: ATTEMPT_ID,
      });

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        acertou: true,
        evidence: { skipped: true, reason: 'persistence_failed' },
      });
    });

    it('exceção inesperada no boundary EE não altera HTTP legado', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockRejectedValue(new Error('unexpected'));

      const response = await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
        evidence: { skipped: true, reason: 'persistence_failed' },
      });
    });

    it('deriva campos confiáveis no servidor e ignora forja do body', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'created', attempt_id: ATTEMPT_ID });

      await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'A',
          attempt_id: ATTEMPT_ID,
          user_id: 'forged-user',
          correct: true,
          context: 'diagnostic',
          source: 'forged_source',
          is_internal: true,
          question_version: 'forged-hash',
          created_at: '2020-01-01T00:00:00.000Z',
          event_type: 'transfer_inventory_missing',
        }),
      );

      expect(mockIngestAttemptEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          route: 'registrar_tentativa',
          user_id: USER_ID,
          question_id: SLUG,
          selected_alternative: 'A',
          correct: false,
          client_body: expect.objectContaining({
            attempt_id: ATTEMPT_ID,
            context: 'diagnostic',
          }),
        }),
      );
      const call = mockIngestAttemptEvent.mock.calls[0][0];
      expect(call.client_body).not.toHaveProperty('user_id');
      expect(call.client_body).not.toHaveProperty('correct');
      expect(call.client_body).not.toHaveProperty('question_version');
    });

    it('inicializa adapter Supabase com o mesmo cliente server-side', async () => {
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockIngestAttemptEvent.mockResolvedValue({ status: 'created', attempt_id: ATTEMPT_ID });

      await POST(
        makeRequest({ modulo_slug: SLUG, opcao_id: 'B', attempt_id: ATTEMPT_ID }),
      );

      expect(mockCreateSupabaseEvidencePersistence).toHaveBeenCalledTimes(1);
      expect(mockCreateSupabaseEvidencePersistence).toHaveBeenCalledWith(
        await mockCreateServerSupabase(),
      );
    });
  });

  describe('FSRS MVP (R3)', () => {
    const { logger } = jest.requireMock('@/lib/logger') as {
      logger: { info: jest.Mock; error: jest.Mock };
    };

    it('flag off → zero writes FSRS (persistence não inicializada)', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(false);
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          topico: 'Enfermagem',
          subtopico: 'Imunização',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockCreateSupabaseFsrsPersistence).not.toHaveBeenCalled();
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
      expect(mockFsrsLoadCard).not.toHaveBeenCalled();
    });

    it('elegível → grava via persistReview', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          topico: 'Enfermagem',
          subtopico: 'Imunização',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockCreateSupabaseFsrsPersistence).toHaveBeenCalledTimes(1);
      expect(mockFsrsLoadCard).toHaveBeenCalledTimes(1);
      expect(mockFsrsPersistReview).toHaveBeenCalledTimes(1);
      expect(mockFsrsPersistReview).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          attemptId: ATTEMPT_ID,
          questionId: SLUG,
          isCorrect: true,
        }),
      );
    });

    it('inelegível (subtópico ausente no meta canônico) → não grava', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockModuloFetch({
        conteudoJson: {
          meta: { banca: 'FGV', topico: 'Enfermagem' },
          question_data: conteudoJson.question_data,
        },
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          topico: 'Enfermagem',
          subtopico: 'Imunização', // body forjado — ignorado
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockCreateSupabaseFsrsPersistence).toHaveBeenCalledTimes(1);
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
    });

    it('falha do FSRS mantém HTTP 200 com gabarito', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockFsrsLoadCard.mockRejectedValue(new Error('fsrs db down'));

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          topico: 'Enfermagem',
          subtopico: 'Imunização',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
    });

    it('retry com mesmo attempt_id → segundo outcome duplicate_equivalent (sem segunda criação)', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockModuloFetch();
      mockFsrsPersistReview
        .mockResolvedValueOnce({
          outcome: 'created',
          writeStatus: 'committed',
          attemptId: ATTEMPT_ID,
          resultingRevision: 1,
        })
        .mockResolvedValueOnce({
          outcome: 'duplicate_equivalent',
          writeStatus: 'none',
          attemptId: ATTEMPT_ID,
          resultingRevision: 1,
        });

      const body = {
        modulo_slug: SLUG,
        opcao_id: 'B',
        attempt_id: ATTEMPT_ID,
        topico: 'Enfermagem',
        subtopico: 'Imunização',
      };

      const first = await POST(makeRequest(body));
      const second = await POST(makeRequest(body));

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(mockFsrsPersistReview).toHaveBeenCalledTimes(2);
      expect(mockFsrsPersistReview.mock.calls[0][0].attemptId).toBe(ATTEMPT_ID);
      expect(mockFsrsPersistReview.mock.calls[1][0].attemptId).toBe(ATTEMPT_ID);
      await expect(mockFsrsPersistReview.mock.results[1].value).resolves.toMatchObject({
        outcome: 'duplicate_equivalent',
        writeStatus: 'none',
      });
    });

    it('attempt_id inválido → gera UUID server-side e registra métrica; ainda HTTP 200', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: 'not-a-uuid',
          topico: 'Enfermagem',
          subtopico: 'Imunização',
        }),
      );

      expect(response.status).toBe(200);
      expect(logger.info).toHaveBeenCalledWith(
        'FSRS MVP: attempt_id missing or invalid; generated server-side',
        expect.objectContaining({
          userId: USER_ID,
          modulo_slug: SLUG,
          had_attempt_id: true,
        }),
      );
      expect(mockFsrsPersistReview).toHaveBeenCalledTimes(1);
      const usedAttemptId = mockFsrsPersistReview.mock.calls[0][0].attemptId as string;
      expect(usedAttemptId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(usedAttemptId).not.toBe('not-a-uuid');
    });

    it('flags EE intocadas quando FSRS está on', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsEvidenceV1InstrumentationEnabled.mockReturnValue(false);
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          topico: 'Enfermagem',
          subtopico: 'Imunização',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        acertou: true,
        opcao_correta_id: 'B',
      });
      expect(mockCreateSupabaseEvidencePersistence).not.toHaveBeenCalled();
      expect(mockIngestAttemptEvent).not.toHaveBeenCalled();
      expect(mockFsrsPersistReview).toHaveBeenCalledTimes(1);
    });

    it('due válido + from_revisoes com cota esgotada → 403 (revisão conta na cota), sem write e sem FSRS', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsFsrsMvpBetaEmail.mockReturnValue(true);
      mockIsFreemiumUnlimitedEmail.mockReturnValue(false);
      mockAssertCanAnswerQuestion.mockResolvedValue({
        allowed: false,
        resetEm: '2026-05-27T03:00:00.000Z',
      });
      mockCountQuestoesHojeForUser.mockResolvedValue(99);

      const { resolveReviewUnitId } = jest.requireActual('@/lib/fsrs/reviewUnit') as typeof import('@/lib/fsrs/reviewUnit');
      const unit = resolveReviewUnitId({
        discipline: 'Enfermagem',
        subtopico: 'Imunização',
      });
      if (!unit.ok) throw new Error('unit');

      const handles = mockModuloFetch({
        dueCard: {
          review_unit_id: unit.reviewUnitId,
          review_unit_kind: 'subtopico',
          due_at: '2026-07-01T00:00:00.000Z',
          last_question_id: 'outro-slug',
          revision: 2,
        },
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        limiteAtingido: true,
        allowed: false,
        resetEm: '2026-05-27T03:00:00.000Z',
      });
      // Card due confirmado não pula o gate: a cota é avaliada mesmo assim.
      expect(mockAssertCanAnswerQuestion).toHaveBeenCalledWith(USER_ID, 'aluno@test.com');
      expect(handles.dueMaybeSingle).toHaveBeenCalledTimes(1);
      expect(handles.insert).not.toHaveBeenCalled();
      expect(handles.update).not.toHaveBeenCalled();
      expect(mockCreateSupabaseFsrsPersistence).not.toHaveBeenCalled();
      expect(mockFsrsLoadCard).not.toHaveBeenCalled();
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
    });

    it('due válido + from_revisoes dentro da cota → 200 e agenda scheduled_review', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsFsrsMvpBetaEmail.mockReturnValue(true);
      mockIsFreemiumUnlimitedEmail.mockReturnValue(false);
      mockAssertCanAnswerQuestion.mockResolvedValue({ allowed: true });
      mockCountQuestoesHojeForUser.mockResolvedValue(2);
      mockIsUserPro.mockResolvedValue(false);

      const { resolveReviewUnitId } = jest.requireActual('@/lib/fsrs/reviewUnit') as typeof import('@/lib/fsrs/reviewUnit');
      const unit = resolveReviewUnitId({
        discipline: 'Enfermagem',
        subtopico: 'Imunização',
      });
      if (!unit.ok) throw new Error('unit');

      const handles = mockModuloFetch({
        dueCard: {
          review_unit_id: unit.reviewUnitId,
          review_unit_kind: 'subtopico',
          due_at: '2026-07-01T00:00:00.000Z',
          last_question_id: 'outro-slug',
          revision: 2,
        },
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(200);
      expect(mockAssertCanAnswerQuestion).toHaveBeenCalledWith(USER_ID, 'aluno@test.com');
      expect(handles.insert).toHaveBeenCalledTimes(1);
      expect(mockFsrsPersistReview).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptId: ATTEMPT_ID,
          attemptContext: 'scheduled_review',
          sameStemFallback: false,
        }),
      );
    });

    it('from_revisoes sem card due → 403 pela cota e não agenda', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsFsrsMvpBetaEmail.mockReturnValue(true);
      mockIsFreemiumUnlimitedEmail.mockReturnValue(false);
      mockAssertCanAnswerQuestion.mockResolvedValue({
        allowed: false,
        resetEm: '2026-05-27T03:00:00.000Z',
      });
      mockModuloFetch({ dueCard: null });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        limiteAtingido: true,
        allowed: false,
      });
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
    });

    it('from_revisoes + mesmo enunciado → same_stem_fallback true no persist', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsFsrsMvpBetaEmail.mockReturnValue(true);
      const { resolveReviewUnitId } = jest.requireActual('@/lib/fsrs/reviewUnit') as typeof import('@/lib/fsrs/reviewUnit');
      const unit = resolveReviewUnitId({
        discipline: 'Enfermagem',
        subtopico: 'Imunização',
      });
      if (!unit.ok) throw new Error('unit');

      mockModuloFetch({
        dueCard: {
          review_unit_id: unit.reviewUnitId,
          review_unit_kind: 'subtopico',
          due_at: '2026-07-01T00:00:00.000Z',
          last_question_id: SLUG,
          revision: 1,
        },
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(200);
      expect(mockFsrsPersistReview).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptContext: 'scheduled_review',
          sameStemFallback: true,
        }),
      );
    });

    it('flag off + from_revisoes → SM-2 (sem FSRS) e freemium normal', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(false);
      mockIsFsrsMvpBetaEmail.mockReturnValue(true);
      mockIsFreemiumUnlimitedEmail.mockReturnValue(false);
      mockAssertCanAnswerQuestion.mockResolvedValue({
        allowed: false,
        resetEm: '2026-05-27T03:00:00.000Z',
      });
      mockModuloFetch();

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(403);
      expect(mockCreateSupabaseFsrsPersistence).not.toHaveBeenCalled();
      expect(mockAssertCanAnswerQuestion).toHaveBeenCalled();
    });

    it('from_revisoes forjado sem beta → cold_practice e freemium aplica', async () => {
      mockIsFsrsMvpEnabled.mockReturnValue(true);
      mockIsFsrsMvpBetaEmail.mockReturnValue(false);
      mockIsFreemiumUnlimitedEmail.mockReturnValue(false);
      mockAssertCanAnswerQuestion.mockResolvedValue({
        allowed: false,
        resetEm: '2026-05-27T03:00:00.000Z',
      });
      mockModuloFetch({
        dueCard: {
          review_unit_id: 'ignored',
          review_unit_kind: 'subtopico',
          due_at: '2026-07-01T00:00:00.000Z',
          last_question_id: null,
          revision: 1,
        },
      });

      const response = await POST(
        makeRequest({
          modulo_slug: SLUG,
          opcao_id: 'B',
          attempt_id: ATTEMPT_ID,
          from_revisoes: true,
        }),
      );

      expect(response.status).toBe(403);
      expect(mockFsrsPersistReview).not.toHaveBeenCalled();
    });
  });
});
