jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  getModulosEstudoVitrineForUserCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
  getAccessibleModulosForNavCached: jest.fn(),
  estudadosSetFromHistorico: (
    historico: { modulo_slug: string; estudo_reverso_concluido: boolean }[],
  ) =>
    new Set(
      historico
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug),
    ),
}));

jest.mock('@/lib/vitrine/facets', () => ({
  ...jest.requireActual('@/lib/vitrine/facets'),
  getVitrineFacets: jest.fn().mockResolvedValue({ bancas: [], assuntos: [] }),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  fetchAccessibleModulosForNav: jest.fn(),
}));

jest.mock('@/lib/vitrine/rpc', () => ({
  fetchVitrinePageFromRpc: jest.fn(),
}));

import {
  getAccessibleModulosForNavCached,
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';
import { getQuestaoNavList } from '@/lib/estudar/questaoNav';
import { getVitrinePage } from '@/lib/vitrine/service';
import { VITRINE_ASSUNTOS_POR_PAGINA } from '@/lib/vitrine/constants';
import {
  attachHistoricoStats,
  buildVitrineFilteredSlugList,
  filterModulosLikeVitrine,
  orderedSlugsFromVitrineGrouping,
  type ModuloEstudoRow,
  type HistoricoQuestaoRow,
} from '@/lib/vitrineFilters';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';

const getModulos = getModulosEstudoVitrineForUserCached as jest.Mock;
const getHistorico = getHistoricoQuestoesForSlugsCached as jest.Mock;
const fetchNavModulosCached = getAccessibleModulosForNavCached as jest.Mock;
const fetchNavModulos = fetchAccessibleModulosForNav as jest.Mock;
const fetchRpcPage = fetchVitrinePageFromRpc as jest.Mock;

const FIXTURE_MODULOS: ModuloEstudoRow[] = [
  {
    id: '1',
    modulo_slug: 'fgv-a-1',
    modulo_nome: 'Fundamentos',
    titulo_aula: 'Assunto Alpha',
    banca: 'FGV',
    created_at: '2024-01-01T00:00:00Z',
    avant_codigo: 100,
  },
  {
    id: '2',
    modulo_slug: 'fgv-a-2',
    modulo_nome: 'Fundamentos',
    titulo_aula: 'Assunto Alpha',
    banca: 'FGV',
    created_at: '2024-01-02T00:00:00Z',
    avant_codigo: 101,
  },
  {
    id: '3',
    modulo_slug: 'cespe-b-1',
    modulo_nome: 'Procedimentos',
    titulo_aula: 'Assunto Beta',
    banca: 'CESPE',
    created_at: '2024-01-03T00:00:00Z',
    avant_codigo: 200,
  },
  {
    id: '4',
    modulo_slug: 'cespe-b-2',
    modulo_nome: 'Procedimentos',
    titulo_aula: 'Assunto Beta',
    banca: 'CESPE',
    created_at: '2024-01-04T00:00:00Z',
    avant_codigo: 201,
  },
  {
    id: '5',
    modulo_slug: 'fgv-c-1',
    modulo_nome: 'Urgências',
    titulo_aula: 'Assunto Gamma',
    banca: 'FGV',
    created_at: '2024-01-05T00:00:00Z',
    avant_codigo: 300,
  },
];

const FIXTURE_HISTORICO: HistoricoQuestaoRow[] = [
  { modulo_slug: 'fgv-a-1', acertou: true, estudo_reverso_concluido: true },
  { modulo_slug: 'fgv-a-2', acertou: false, estudo_reverso_concluido: false },
];

function slugsFromGroups(groups: VitrineGrupoSubtopico[]): string[] {
  const slugs: string[] = [];
  for (const g of groups) {
    for (const q of g.questoes) slugs.push(q.slug);
  }
  return slugs;
}

async function allSlugsFromVitrinePages(
  userId: string,
  filters: { banca?: string; assunto?: string; q?: string } = {},
): Promise<string[]> {
  const first = await getVitrinePage({ userId, page: 1, filters });
  const slugs = slugsFromGroups(first.groups);
  for (let p = 2; p <= first.pagination.totalPages; p++) {
    const page = await getVitrinePage({ userId, page: p, filters });
    slugs.push(...slugsFromGroups(page.groups));
  }
  return slugs;
}

function expectedSlugList(
  modulos: ModuloEstudoRow[],
  historico: HistoricoQuestaoRow[],
  filters: { banca?: string; assunto?: string; q?: string },
): string[] {
  return buildVitrineFilteredSlugList(modulos, historico, filters);
}

function setupCatalog(modulos: ModuloEstudoRow[], historico: HistoricoQuestaoRow[] = []) {
  getModulos.mockResolvedValue(modulos);
  fetchNavModulos.mockResolvedValue(modulos);
  fetchNavModulosCached.mockResolvedValue(modulos);
  getHistorico.mockImplementation(async (_userId: string, slugs: string[]) =>
    historico.filter((h) => slugs.includes(h.modulo_slug)),
  );
  fetchRpcPage.mockRejectedValue(new Error('RPC indisponível nos testes de paridade'));
}

describe('paridade vitrine vs player', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('orderedSlugsFromVitrineGrouping e buildVitrineFilteredSlugList produzem mesma ordem', () => {
    const withStats = attachHistoricoStats(FIXTURE_MODULOS, FIXTURE_HISTORICO);
    const filtered = filterModulosLikeVitrine(withStats, { banca: 'FGV' });

    const viaGrouping = orderedSlugsFromVitrineGrouping(filtered);
    const viaBuilder = buildVitrineFilteredSlugList(FIXTURE_MODULOS, FIXTURE_HISTORICO, {
      banca: 'FGV',
    });

    expect(viaBuilder).toEqual(viaGrouping);
    expect(viaBuilder[0]).toBe('fgv-a-1');
    expect(viaBuilder).toContain('fgv-a-2');
    expect(viaBuilder).toContain('fgv-c-1');
    expect(viaBuilder).not.toContain('cespe-b-1');
  });

  it('getQuestaoNavList retorna mesma ordem de slugs que buildVitrineFilteredSlugList', async () => {
    setupCatalog(FIXTURE_MODULOS, FIXTURE_HISTORICO);

    const expected = expectedSlugList(FIXTURE_MODULOS, FIXTURE_HISTORICO, { banca: 'FGV' });

    const nav = await getQuestaoNavList({
      userId: 'user-paridade',
      slug: 'fgv-a-2',
      tituloAula: 'Assunto Alpha',
      vitrineFilters: { banca: 'FGV' },
    });

    expect(nav.lista.map((i) => i.modulo_slug)).toEqual(expected);
    expect(nav.indexAtual).toBe(expected.indexOf('fgv-a-2'));
  });

  it('vitrine JS (todas as páginas) preserva ordem de slugs do player', async () => {
    setupCatalog(FIXTURE_MODULOS, FIXTURE_HISTORICO);

    const expected = expectedSlugList(FIXTURE_MODULOS, FIXTURE_HISTORICO, { banca: 'FGV' });
    const vitrineSlugs = await allSlugsFromVitrinePages('user-paridade', { banca: 'FGV' });

    expect(vitrineSlugs).toEqual(expected);
  });

  it('RPC (caminho feliz) preserva ordem de slugs do player', async () => {
    const rpcGroups: VitrineGrupoSubtopico[] = [
      {
        titulo_aula: 'Assunto Alpha',
        modulo_nome: 'Fundamentos',
        banca: 'FGV',
        questoes: [
          {
            slug: 'fgv-a-1',
            numero: 1,
            status: 'estudada',
            avant_codigo: 100,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            slug: 'fgv-a-2',
            numero: 2,
            status: 'nao_estudada',
            avant_codigo: 101,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        acertos: 1,
        erros: 0,
        totalResolvidas: 1,
        totalQuestoes: 2,
        totalNeuroSlides: 8,
        trabalhadas: 1,
        percentual: 100,
        firstSlug: 'fgv-a-1',
      },
      {
        titulo_aula: 'Assunto Gamma',
        modulo_nome: 'Urgências',
        banca: 'FGV',
        questoes: [
          {
            slug: 'fgv-c-1',
            numero: 1,
            status: 'nao_estudada',
            avant_codigo: 300,
            created_at: '2024-01-05T00:00:00Z',
          },
        ],
        acertos: 0,
        erros: 0,
        totalResolvidas: 0,
        totalQuestoes: 1,
        totalNeuroSlides: 4,
        trabalhadas: 0,
        percentual: 0,
        firstSlug: 'fgv-c-1',
      },
    ];

    fetchRpcPage.mockResolvedValue({
      groups: rpcGroups,
      pagination: { page: 1, perPage: 12, totalGroups: 2, totalPages: 1 },
      totalModulosFiltrados: 3,
      facets: { bancas: ['FGV'], assuntos: ['Assunto Alpha', 'Assunto Gamma'] },
    });

    const expected = expectedSlugList(FIXTURE_MODULOS, FIXTURE_HISTORICO, { banca: 'FGV' });
    const vitrineSlugs = slugsFromGroups(
      (await getVitrinePage({ userId: 'user-rpc', page: 1, filters: { banca: 'FGV' } })).groups,
    );

    expect(fetchRpcPage).toHaveBeenCalled();
    expect(getModulos).not.toHaveBeenCalled();
    expect(vitrineSlugs).toEqual(expected);
  });
});

describe('paginação vitrine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchRpcPage.mockRejectedValue(new Error('RPC indisponível'));
  });

  it('page 2 retorna grupos diferentes da page 1', async () => {
    const manyAssuntos: ModuloEstudoRow[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i + 1),
      modulo_slug: `slug-${i + 1}`,
      modulo_nome: 'T',
      titulo_aula: `Assunto ${String(i + 1).padStart(2, '0')}`,
      banca: 'FGV',
      created_at: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`,
      avant_codigo: i + 1,
    }));

    setupCatalog(manyAssuntos);

    const page1 = await getVitrinePage({ userId: 'u', page: 1 });
    const page2 = await getVitrinePage({ userId: 'u', page: 2 });

    expect(page1.pagination.totalGroups).toBe(15);
    expect(page1.pagination.totalPages).toBe(Math.ceil(15 / VITRINE_ASSUNTOS_POR_PAGINA));
    expect(page1.groups).toHaveLength(VITRINE_ASSUNTOS_POR_PAGINA);
    expect(page2.groups.length).toBeGreaterThan(0);
    expect(page2.groups.length).toBeLessThanOrEqual(VITRINE_ASSUNTOS_POR_PAGINA);

    const titulosPage1 = page1.groups.map((g) => g.titulo_aula);
    const titulosPage2 = page2.groups.map((g) => g.titulo_aula);
    expect(titulosPage2.some((t) => titulosPage1.includes(t))).toBe(false);
  });

  it('totalGroups reflete assuntos únicos após filtros', async () => {
    setupCatalog(FIXTURE_MODULOS, FIXTURE_HISTORICO);

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { banca: 'FGV' },
    });

    expect(result.pagination.totalGroups).toBe(2);
    expect(result.totalModulosFiltrados).toBe(3);
  });
});

describe('filtros q e avant_codigo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchRpcPage.mockRejectedValue(new Error('RPC indisponível'));
  });

  it('filtra por slug q-{avant_codigo}', async () => {
    setupCatalog(FIXTURE_MODULOS);

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { q: 'q-200' },
    });

    expect(fetchRpcPage).toHaveBeenCalledWith({
      userId: 'u',
      page: 1,
      filters: { q: 'q-200' },
    });
    expect(result.totalModulosFiltrados).toBe(1);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].questoes).toHaveLength(1);
    expect(result.groups[0].questoes[0].slug).toBe('cespe-b-1');
    expect(result.groups[0].questoes[0].avant_codigo).toBe(200);
  });

  it('filtra por número avant_codigo sem prefixo q-', async () => {
    setupCatalog(FIXTURE_MODULOS);

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { q: '101' },
    });

    expect(result.totalModulosFiltrados).toBe(1);
    expect(slugsFromGroups(result.groups)).toEqual(['fgv-a-2']);
  });

  it('paridade player com filtro q igual à vitrine', async () => {
    setupCatalog(FIXTURE_MODULOS);

    const filters = { q: 'q-200' };
    const expected = expectedSlugList(FIXTURE_MODULOS, [], filters);
    const vitrineSlugs = await allSlugsFromVitrinePages('u', filters);

    const nav = await getQuestaoNavList({
      userId: 'u',
      slug: 'cespe-b-1',
      tituloAula: 'Assunto Beta',
      vitrineFilters: filters,
    });

    expect(vitrineSlugs).toEqual(expected);
    expect(nav.lista.map((i) => i.modulo_slug)).toEqual(expected);
  });
});

describe('grupo com múltiplas questões', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchRpcPage.mockRejectedValue(new Error('RPC indisponível'));
  });

  it('inclui todas as questões do assunto no JSON do grupo', async () => {
    const modulosNoAssunto: ModuloEstudoRow[] = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      modulo_slug: `multi-${i + 1}`,
      modulo_nome: 'T',
      titulo_aula: 'Assunto Denso',
      banca: 'FGV',
      created_at: `2024-02-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      avant_codigo: 500 + i,
    }));

    setupCatalog(modulosNoAssunto);

    const result = await getVitrinePage({ userId: 'u', page: 1, filters: { assunto: 'Assunto Denso' } });

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].totalQuestoes).toBe(8);
    expect(result.groups[0].questoes).toHaveLength(8);
    expect(result.groups[0].questoes.map((q) => q.slug)).toEqual(
      modulosNoAssunto
        .slice()
        .sort((a, b) => a.created_at!.localeCompare(b.created_at!))
        .map((m) => m.modulo_slug),
    );
  });
});
