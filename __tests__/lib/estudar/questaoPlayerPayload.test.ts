jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn(),
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

import { userHasModuloAccess } from '@/lib/concursos/entitlements';
import {
  getQuestaoBySlugCached,
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
} from '@/lib/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { getQuestaoNavList } from '@/lib/estudar/questaoNav';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';

const mockUserHasModuloAccess = userHasModuloAccess as jest.MockedFunction<
  typeof userHasModuloAccess
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
  reverse_study_slides: [{ type: 'golden_rule', content: 'Regra de ouro' }],
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

describe('buildEstudarQuestaoPlayerPayload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('anônimo usa cache anon e não checa entitlement', async () => {
    mockGetQuestaoBySlugCached.mockResolvedValue({
      id: 'mod-anon',
      modulo_slug: SLUG,
      conteudo_json: conteudoJson,
      banca: 'FGV',
      titulo_aula: 'Urgências',
      modulo_nome: 'Urgências',
      created_at: '2024-01-01T00:00:00.000Z',
      avant_codigo: null,
    });

    const result = await buildEstudarQuestaoPlayerPayload({ slug: SLUG });

    expect(mockUserHasModuloAccess).not.toHaveBeenCalled();
    expect(mockGetQuestaoBySlugCached).toHaveBeenCalledWith(SLUG);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.payload.dados.question_data.options?.[0]).not.toHaveProperty('is_correct');
  });

  it('anônimo retorna not_found quando cache não tem questão', async () => {
    mockGetQuestaoBySlugCached.mockResolvedValue(null);

    const result = await buildEstudarQuestaoPlayerPayload({ slug: 'inexistente' });

    expect(result).toEqual({ status: 'not_found' });
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
});
