jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn(),
  getAccessibleModuloSlugs: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  getQuestaoBySlugCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
  estudadosSetFromHistorico: jest.fn(() => new Set<string>()),
}));

jest.mock('@/lib/supabase/server-auth', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/estudar/questaoNav', () => ({
  getQuestaoNavList: jest.fn(),
}));

jest.mock('@/lib/spaced-repetition', () => ({
  getTodayReviews: jest.fn(),
}));

jest.mock('@/lib/fsrs/reviewsToday', () => ({
  getReviewsToday: jest.fn(),
  reviewsTodaySlugs: jest.fn((result: { reviews: Array<{ modulo_slug: string }> }) =>
    result.reviews.map((r) => r.modulo_slug),
  ),
}));

import { getAccessibleModuloSlugs, userHasModuloAccess } from '@/lib/concursos/entitlements';
import {
  getQuestaoBySlugCached,
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
} from '@/lib/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { getQuestaoNavList } from '@/lib/estudar/questaoNav';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { getReviewsToday } from '@/lib/fsrs/reviewsToday';
import {
  buildEstudarQuestaoPlayerPayload,
  patchQuestaoEstudadaInPayload,
} from '@/lib/estudar/questaoPlayerPayload';
import type { AvantLessonPlayerProps } from '@/types/lesson';

const mockUserHasModuloAccess = userHasModuloAccess as jest.MockedFunction<
  typeof userHasModuloAccess
>;
const mockGetAccessibleModuloSlugs = getAccessibleModuloSlugs as jest.MockedFunction<
  typeof getAccessibleModuloSlugs
>;
const mockGetQuestaoBySlugCached = getQuestaoBySlugCached as jest.MockedFunction<
  typeof getQuestaoBySlugCached
>;
const mockGetHistoricoQuestoesForSlugsCached =
  getHistoricoQuestoesForSlugsCached as jest.MockedFunction<
    typeof getHistoricoQuestoesForSlugsCached
  >;
const mockEstudadosSetFromHistorico = estudadosSetFromHistorico as jest.MockedFunction<
  typeof estudadosSetFromHistorico
>;
const mockCreateSupabaseServerClient = createSupabaseServerClient as jest.MockedFunction<
  typeof createSupabaseServerClient
>;
const mockGetQuestaoNavList = getQuestaoNavList as jest.MockedFunction<typeof getQuestaoNavList>;
const mockGetTodayReviews = getTodayReviews as jest.MockedFunction<typeof getTodayReviews>;
const mockGetReviewsToday = getReviewsToday as jest.MockedFunction<typeof getReviewsToday>;

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-nav-meio';

const conteudoJson = {
  meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
  question_data: {
    instruction: 'Assinale a alternativa correta.',
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
    ],
  },
  reverse_study_slides: [{ type: 'golden_rule' as const, content: 'Regra de ouro' }],
};

function mockSupabaseModuloRow() {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: {
      id: 'mod-1',
      modulo_slug: SLUG,
      conteudo_json: conteudoJson,
      titulo_aula: 'Urgências',
      modulo_nome: 'Urgências',
      avant_codigo: 42,
    },
    error: null,
  });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select, eq });
  return { from, maybeSingle };
}

describe('patchQuestaoEstudadaInPayload', () => {
  const basePayload: AvantLessonPlayerProps = {
    dados: conteudoJson,
    mode: 'live',
    moduloSlug: SLUG,
    questoesDoAssunto: [
      { slug: 'questao-anterior', estudada: false },
      { slug: SLUG, estudada: false },
      { slug: 'questao-proxima', estudada: false },
    ],
  };

  it('marca estudada apenas no slug alvo', () => {
    const patched = patchQuestaoEstudadaInPayload(basePayload, SLUG);

    expect(patched.questoesDoAssunto).toEqual([
      { slug: 'questao-anterior', estudada: false },
      { slug: SLUG, estudada: true },
      { slug: 'questao-proxima', estudada: false },
    ]);
    expect(patched).not.toBe(basePayload);
    expect(basePayload.questoesDoAssunto?.[1].estudada).toBe(false);
  });

  it('retorna o mesmo objeto quando slug não está na lista', () => {
    const patched = patchQuestaoEstudadaInPayload(basePayload, 'outro-slug');
    expect(patched).toBe(basePayload);
  });

  it('retorna o mesmo objeto quando não há questoesDoAssunto', () => {
    const withoutList = { ...basePayload, questoesDoAssunto: undefined };
    const patched = patchQuestaoEstudadaInPayload(withoutList, SLUG);
    expect(patched).toBe(withoutList);
  });
});

describe('buildEstudarQuestaoPlayerPayload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessibleModuloSlugs.mockResolvedValue(new Set());
    mockEstudadosSetFromHistorico.mockReturnValue(new Set());
    mockGetHistoricoQuestoesForSlugsCached.mockResolvedValue([]);
    mockGetQuestaoNavList.mockResolvedValue({
      lista: [
        { id: '1', modulo_slug: 'questao-anterior' },
        { id: '2', modulo_slug: SLUG },
        { id: '3', modulo_slug: 'questao-proxima' },
      ],
      questoesDoAssunto: [
        { slug: 'questao-anterior', estudada: false },
        { slug: SLUG, estudada: true },
        { slug: 'questao-proxima', estudada: false },
      ],
      indexAtual: 1,
    });
  });

  it('retorna forbidden quando logado sem entitlement', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
    });

    expect(result).toEqual({ status: 'forbidden' });
    expect(mockGetQuestaoNavList).not.toHaveBeenCalled();
  });

  it('admin abre questão via cache sem checar matrícula', async () => {
    mockGetQuestaoBySlugCached.mockResolvedValue({
      id: 'mod-1',
      modulo_slug: SLUG,
      conteudo_json: conteudoJson,
      banca: 'FGV',
      titulo_aula: 'Urgências',
      modulo_nome: 'Urgências',
      created_at: '2024-01-01T00:00:00.000Z',
      avant_codigo: 42,
    });
    mockCreateSupabaseServerClient.mockResolvedValue({ from: jest.fn() } as never);

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      isAdmin: true,
    });

    expect(mockUserHasModuloAccess).not.toHaveBeenCalled();
    expect(result.status).toBe('ok');
  });

  it('retorna not_found quando o módulo não existe (logado)', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const supabase = { from: jest.fn().mockReturnValue({ select, eq }) };

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: 'slug-inexistente',
      userId: USER_ID,
      supabase: supabase as never,
    });

    expect(result).toEqual({ status: 'not_found' });
  });

  it('monta payload sem gabarito e com slugs de navegação (logado)', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const supabase = mockSupabaseModuloRow();

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: supabase as never,
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.moduloSlug).toBe(SLUG);
    expect(result.payload.mode).toBe('live');
    expect(result.payload.anteriorSlug).toBe('questao-anterior');
    expect(result.payload.proximaSlug).toBe('questao-proxima');
    expect(result.payload.listaContexto).toEqual({ atual: 2, total: 3 });
    expect(result.payload.avantCodigo).toBe(42);
    expect(result.payload.dados.question_data.options).toEqual([
      { id: 'A', text: 'Opção A' },
      { id: 'B', text: 'Opção B' },
    ]);
    expect(mockCreateSupabaseServerClient).not.toHaveBeenCalled();
    expect(mockGetQuestaoNavList).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        slug: SLUG,
        tituloAula: 'Urgências',
      }),
    );
  });

  it('from=revisoes usa getReviewsToday (fonte centralizada FSRS/SM-2)', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    mockGetReviewsToday.mockResolvedValue({
      source: 'fsrs',
      reviews: [
        {
          modulo_slug: 'revisao-1',
          review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=rcp',
          same_stem_fallback: false,
          inventory_missing: false,
        },
        {
          modulo_slug: SLUG,
          review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=rcp',
          same_stem_fallback: true,
          inventory_missing: false,
        },
      ],
      telemetry: { same_stem_fallback: 1, inventory_missing: 0 },
    });
    mockEstudadosSetFromHistorico.mockReturnValue(new Set([SLUG]));
    const supabase = mockSupabaseModuloRow();

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      userEmail: 'beta@avant.test',
      supabase: supabase as never,
      searchParams: { from: 'revisoes' },
    });

    expect(mockGetReviewsToday).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        email: 'beta@avant.test',
      }),
    );
    expect(mockGetTodayReviews).not.toHaveBeenCalled();
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.payload.questoesDoAssunto?.map(({ slug, estudada }) => ({ slug, estudada }))).toEqual([
      { slug: 'revisao-1', estudada: false },
      { slug: SLUG, estudada: true },
    ]);
    expect(result.payload.fromRevisoes).toBe(true);
    expect(result.payload.sameStemFallback).toBe(true);
    expect(result.payload.proximaSlug).toBeNull();
    expect(result.payload.anteriorSlug).toBe('revisao-1?from=revisoes');
  });

  it('primeira questão da lista não define anteriorSlug', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    mockGetQuestaoNavList.mockResolvedValue({
      lista: [
        { id: '1', modulo_slug: 'questao-primeira' },
        { id: '2', modulo_slug: 'questao-segunda' },
      ],
      questoesDoAssunto: [
        { slug: 'questao-primeira', estudada: false },
        { slug: 'questao-segunda', estudada: false },
      ],
      indexAtual: 0,
    });

    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'mod-1',
        modulo_slug: 'questao-primeira',
        conteudo_json: conteudoJson,
        titulo_aula: 'Urgências',
        modulo_nome: 'Urgências',
        avant_codigo: 1,
      },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const supabase = { from: jest.fn().mockReturnValue({ select, eq }) };

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: 'questao-primeira',
      userId: USER_ID,
      supabase: supabase as never,
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.anteriorSlug).toBeNull();
    expect(result.payload.proximaSlug).toBe('questao-segunda');
    expect(result.payload.listaContexto).toEqual({ atual: 1, total: 2 });
  });

  it('índice > 0 define anteriorSlug (ex.: questão 8 de 1067)', async () => {
    const slugAtual = 'q-8';
    const lista1067 = Array.from({ length: 1067 }, (_, i) => ({
      id: String(i + 1),
      modulo_slug: `q-${i + 1}`,
    }));

    mockUserHasModuloAccess.mockResolvedValue(true);
    mockGetQuestaoNavList.mockResolvedValue({
      lista: lista1067,
      questoesDoAssunto: lista1067.map((item) => ({
        slug: item.modulo_slug,
        estudada: false,
      })),
      indexAtual: 7,
    });

    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'mod-8',
        modulo_slug: slugAtual,
        conteudo_json: conteudoJson,
        titulo_aula: 'Assunto Denso',
        modulo_nome: 'Fundamentos',
        avant_codigo: 1067,
      },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const supabase = { from: jest.fn().mockReturnValue({ select, eq }) };

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: slugAtual,
      userId: USER_ID,
      supabase: supabase as never,
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.anteriorSlug).toBe('q-7');
    expect(result.payload.proximaSlug).toBe('q-9');
    expect(result.payload.listaContexto).toEqual({ atual: 8, total: 1067 });
    expect(result.payload.avantCodigo).toBe(1067);
  });

  it('sem userId retorna not_found', async () => {
    const result = await buildEstudarQuestaoPlayerPayload({ slug: SLUG });

    expect(mockUserHasModuloAccess).not.toHaveBeenCalled();
    expect(mockGetQuestaoBySlugCached).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'not_found' });
  });

  it('propaga DataServiceUnavailableError do cache', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const supabase = mockSupabaseModuloRow();
    const { DataServiceUnavailableError } = await import('@/lib/dataServiceError');
    mockGetQuestaoNavList.mockRejectedValue(new DataServiceUnavailableError());

    await expect(
      buildEstudarQuestaoPlayerPayload({
        slug: SLUG,
        userId: USER_ID,
        supabase: supabase as never,
      }),
    ).rejects.toBeInstanceOf(DataServiceUnavailableError);
  });

  it('propaga DataServiceUnavailableError quando o Supabase falha ao carregar módulo', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'connection timeout', code: 'PGRST000' },
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const supabase = { from: jest.fn().mockReturnValue({ select, eq }) };
    const { DataServiceUnavailableError } = await import('@/lib/dataServiceError');

    await expect(
      buildEstudarQuestaoPlayerPayload({
        slug: SLUG,
        userId: USER_ID,
        supabase: supabase as never,
      }),
    ).rejects.toBeInstanceOf(DataServiceUnavailableError);

    expect(mockGetQuestaoNavList).not.toHaveBeenCalled();
  });

  it('propaga DataServiceUnavailableError quando entitlement falha por infra', async () => {
    mockUserHasModuloAccess.mockRejectedValue(new Error('connection refused'));
    const { DataServiceUnavailableError } = await import('@/lib/dataServiceError');

    await expect(
      buildEstudarQuestaoPlayerPayload({
        slug: SLUG,
        userId: USER_ID,
      }),
    ).rejects.toBeInstanceOf(DataServiceUnavailableError);
  });

  it('layers=core omite NeuroSlides do payload', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const supabase = mockSupabaseModuloRow();

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: supabase as never,
      layers: 'core',
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.payload.dados).not.toHaveProperty('reverse_study_slides');
    expect(result.payload.dados.question_data.options).toHaveLength(2);
  });

  it('repassa page da vitrine no vitrineQuerySuffix e nos slugs de navegação', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const supabase = mockSupabaseModuloRow();

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: supabase as never,
      searchParams: { banca: 'FGV', page: '3' },
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.vitrineQuerySuffix).toBe('?banca=FGV&page=3');
    expect(result.payload.anteriorSlug).toBe('questao-anterior?banca=FGV&page=3');
    expect(result.payload.proximaSlug).toBe('questao-proxima?banca=FGV&page=3');
  });

  it('preserva disciplina no vitrineQuerySuffix (evita player congelado / SINCRONIZANDO)', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const supabase = mockSupabaseModuloRow();

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: supabase as never,
      searchParams: { disciplina: 'portugues' },
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.vitrineQuerySuffix).toBe('?disciplina=portugues');
    expect(result.payload.anteriorSlug).toBe('questao-anterior?disciplina=portugues');
    expect(result.payload.proximaSlug).toBe('questao-proxima?disciplina=portugues');
  });

  it('preserva query de caderno em vitrineQuerySuffix (evita player congelado)', async () => {
    const cadernoId = '550e8400-e29b-41d4-a716-446655440099';
    mockUserHasModuloAccess.mockResolvedValue(true);
    mockGetAccessibleModuloSlugs.mockResolvedValue(
      new Set(['questao-anterior', SLUG, 'questao-proxima']),
    );

    const maybeSingleModulo = jest.fn().mockResolvedValue({
      data: {
        id: 'mod-1',
        modulo_slug: SLUG,
        conteudo_json: conteudoJson,
        titulo_aula: 'Urgências',
        modulo_nome: 'Urgências',
        avant_codigo: 42,
      },
      error: null,
    });
    const notebookMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: cadernoId },
      error: null,
    });
    const order = jest.fn().mockResolvedValue({
      data: [
        { modulo_slug: 'questao-anterior' },
        { modulo_slug: SLUG },
        { modulo_slug: 'questao-proxima' },
      ],
      error: null,
    });
    const eqUser = jest.fn().mockReturnValue({ maybeSingle: notebookMaybeSingle });
    const eqNotebookId = jest.fn().mockReturnValue({ eq: eqUser });
    const selectNotebook = jest.fn().mockReturnValue({ eq: eqNotebookId });
    const eqItemsNotebook = jest.fn().mockReturnValue({ order });
    const selectItems = jest.fn().mockReturnValue({ eq: eqItemsNotebook });
    const eqModulo = jest.fn().mockReturnValue({ maybeSingle: maybeSingleModulo });
    const selectModulo = jest.fn().mockReturnValue({ eq: eqModulo });
    const from = jest.fn((table: string) => {
      if (table === 'modulos_estudo') return { select: selectModulo, eq: eqModulo };
      if (table === 'study_notebooks') return { select: selectNotebook, eq: eqNotebookId };
      if (table === 'study_notebook_items') return { select: selectItems, eq: eqItemsNotebook };
      return { select: selectModulo };
    });

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
      searchParams: { from: 'caderno', caderno_id: cadernoId },
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    const expectedSuffix = `?from=caderno&caderno_id=${encodeURIComponent(cadernoId)}`;
    expect(result.payload.vitrineQuerySuffix).toBe(expectedSuffix);
    expect(result.payload.fromCaderno).toBe(cadernoId);
    expect(result.payload.proximaSlug).toBe(`questao-proxima${expectedSuffix}`);
  });

  it('navegação do caderno pula itens fora do pacote (evita 404 na próxima)', async () => {
    const cadernoId = '550e8400-e29b-41d4-a716-446655440099';
    const proximaAcessivel = 'questao-proxima-acessivel';
    mockUserHasModuloAccess.mockResolvedValue(true);
    mockGetAccessibleModuloSlugs.mockResolvedValue(
      new Set(['questao-anterior', SLUG, proximaAcessivel]),
    );

    const maybeSingleModulo = jest.fn().mockResolvedValue({
      data: {
        id: 'mod-1',
        modulo_slug: SLUG,
        conteudo_json: conteudoJson,
        titulo_aula: 'Urgências',
        modulo_nome: 'Urgências',
        avant_codigo: 42,
      },
      error: null,
    });
    const notebookMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: cadernoId },
      error: null,
    });
    const order = jest.fn().mockResolvedValue({
      data: [
        { modulo_slug: 'questao-anterior' },
        { modulo_slug: SLUG },
        { modulo_slug: 'questao-bloqueada' },
        { modulo_slug: proximaAcessivel },
      ],
      error: null,
    });
    const eqUser = jest.fn().mockReturnValue({ maybeSingle: notebookMaybeSingle });
    const eqNotebookId = jest.fn().mockReturnValue({ eq: eqUser });
    const selectNotebook = jest.fn().mockReturnValue({ eq: eqNotebookId });
    const eqItemsNotebook = jest.fn().mockReturnValue({ order });
    const selectItems = jest.fn().mockReturnValue({ eq: eqItemsNotebook });
    const eqModulo = jest.fn().mockReturnValue({ maybeSingle: maybeSingleModulo });
    const selectModulo = jest.fn().mockReturnValue({ eq: eqModulo });
    const from = jest.fn((table: string) => {
      if (table === 'modulos_estudo') return { select: selectModulo, eq: eqModulo };
      if (table === 'study_notebooks') return { select: selectNotebook, eq: eqNotebookId };
      if (table === 'study_notebook_items') return { select: selectItems, eq: eqItemsNotebook };
      return { select: selectModulo };
    });

    const result = await buildEstudarQuestaoPlayerPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
      searchParams: { from: 'caderno', caderno_id: cadernoId },
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    const expectedSuffix = `?from=caderno&caderno_id=${encodeURIComponent(cadernoId)}`;
    expect(result.payload.proximaSlug).toBe(`${proximaAcessivel}${expectedSuffix}`);
    expect(result.payload.listaContexto).toEqual({ atual: 2, total: 3 });
    expect(result.payload.questoesDoAssunto?.map((q) => q.slug)).not.toContain('questao-bloqueada');
  });
});
