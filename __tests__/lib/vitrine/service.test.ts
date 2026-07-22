jest.mock('@/lib/cache', () => ({
  getModulosEstudoVitrineForUserCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
  getAccessibleModulosForNavCached: jest.fn(),
  getModulosEstudoCached: jest.fn(),
}));

jest.mock('@/lib/vitrine/facets', () => ({
  ...jest.requireActual('@/lib/vitrine/facets'),
  getVitrineFacets: jest.fn(),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  fetchAccessibleModulosForNav: jest.fn(),
  ensureGeralCadastroMatricula: jest.fn().mockResolvedValue(null),
  getAccessibleModulosForMatriculatedEditalPacote: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  })),
}));

jest.mock('@/lib/vitrine/rpc', () => ({
  fetchVitrinePageFromRpc: jest.fn(),
}));

jest.mock('@/lib/vitrine/slideCounts', () => ({
  fetchSlideCountsByModuloIds: jest.fn().mockResolvedValue(new Map()),
}));

import {
  getAccessibleModulosForNavCached,
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
  getModulosEstudoCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import { getVitrineFacets } from '@/lib/vitrine/facets';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';
import { getVitrinePage } from '@/lib/vitrine/service';
import { SCALE_LIMITS } from '@/lib/scale/constants';

const getModulos = getModulosEstudoVitrineForUserCached as jest.Mock;
const getHistorico = getHistoricoQuestoesForSlugsCached as jest.Mock;
const fetchNavModulosCached = getAccessibleModulosForNavCached as jest.Mock;
const fetchNavModulos = fetchAccessibleModulosForNav as jest.Mock;
const fetchRpcPage = fetchVitrinePageFromRpc as jest.Mock;
const fetchFacets = getVitrineFacets as jest.Mock;
const getModulosCatalog = getModulosEstudoCached as jest.Mock;

describe('getVitrinePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getModulos.mockResolvedValue([]);
    getHistorico.mockResolvedValue([]);
    getModulosCatalog.mockResolvedValue([]);
    fetchFacets.mockResolvedValue({ bancas: [], assuntos: [] });
    fetchRpcPage.mockRejectedValue(new Error('RPC indisponível nos testes'));
  });

  it('retorna página de grupos, facets e paginação', async () => {
    getModulos.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'slug-a',
        modulo_nome: 'T',
        titulo_aula: 'Assunto 1',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: 1,
      },
      {
        id: '2',
        modulo_slug: 'slug-b',
        modulo_nome: 'T',
        titulo_aula: 'Assunto 2',
        banca: 'CESPE',
        created_at: '2024-01-02',
        avant_codigo: 2,
      },
    ]);

    const result = await getVitrinePage({ userId: 'user-1', page: 1 });

    expect(result.facets.bancas).toEqual(['CESPE', 'FGV']);
    expect(result.pagination.totalGroups).toBe(2);
    expect(result.groups).toHaveLength(2);
    expect(getHistorico).toHaveBeenCalledWith('user-1', ['slug-a', 'slug-b']);
  });

  it('filtra por banca antes de paginar', async () => {
    fetchNavModulosCached.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 's1',
        modulo_nome: 'T',
        titulo_aula: 'A',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: null,
      },
    ]);

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { banca: 'FGV' },
    });

    expect(fetchNavModulosCached).toHaveBeenCalledWith('u', { banca: 'FGV' });
    expect(getModulos).not.toHaveBeenCalled();
    expect(result.pagination.totalGroups).toBe(1);
    expect(result.groups[0].banca).toBe('FGV');
    expect(getHistorico).toHaveBeenCalledWith('u', ['s1']);
  });

  it('usa getAccessibleModulosForNavCached quando assunto está na URL', async () => {
    fetchNavModulosCached.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 's1',
        modulo_nome: 'T',
        titulo_aula: 'Assunto X',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: null,
      },
    ]);

    await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { assunto: 'Assunto X' },
    });

    expect(fetchNavModulosCached).toHaveBeenCalledWith('u', { titulo_aula: 'Assunto X' });
    expect(getModulos).not.toHaveBeenCalled();
    expect(getHistorico).toHaveBeenCalledWith('u', ['s1']);
  });

  it('usa RPC quando não há filtro q', async () => {
    getModulos.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'slug-a',
        modulo_nome: 'T',
        titulo_aula: 'Assunto 1',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: 1,
      },
    ]);
    fetchRpcPage.mockResolvedValue({
      groups: [
        {
          titulo_aula: 'Assunto 1',
          modulo_nome: 'T',
          banca: 'FGV',
          questoes: [
            {
              slug: 'slug-a',
              numero: 1,
              status: 'nao_estudada',
              avant_codigo: 1,
              created_at: '2024-01-01',
            },
          ],
          acertos: 0,
          erros: 0,
          totalResolvidas: 0,
          totalQuestoes: 1,
          trabalhadas: 0,
          percentual: 0,
          firstSlug: 'slug-a',
        },
      ],
      pagination: { page: 1, perPage: 12, totalGroups: 1, totalPages: 1 },
      totalModulosFiltrados: 1,
      facets: { bancas: ['FGV'], assuntos: ['Assunto 1'] },
    });

    const result = await getVitrinePage({ userId: 'user-1', page: 1 });

    expect(fetchRpcPage).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      filters: {},
    });
    expect(fetchFacets).not.toHaveBeenCalled();
    expect(getHistorico).not.toHaveBeenCalled();
    expect(result.groups).toHaveLength(1);
    expect(result.facets).toEqual({ bancas: ['FGV'], assuntos: ['Assunto 1'] });
  });

  it('usa getVitrineFacets quando RPC não traz facets (rollout)', async () => {
    fetchRpcPage.mockResolvedValue({
      groups: [{ titulo_aula: 'Aula 1', modulo_nome: 'M', banca: 'FGV', questoes: [] }],
      pagination: { page: 1, perPage: 12, totalGroups: 1, totalPages: 1 },
      totalModulosFiltrados: 1,
    });
    fetchFacets.mockResolvedValue({ bancas: ['FGV'], assuntos: ['A'] });

    const result = await getVitrinePage({ userId: 'user-1', page: 1 });

    expect(fetchFacets).toHaveBeenCalledWith({
      userId: 'user-1',
      bancas: undefined,
      isAdmin: false,
    });
    expect(result.facets).toEqual({ bancas: ['FGV'], assuntos: ['A'] });
  });

  it('usa RPC também quando há filtro q', async () => {
    fetchRpcPage.mockResolvedValue({
      groups: [],
      pagination: { page: 1, perPage: 12, totalGroups: 0, totalPages: 1 },
      totalModulosFiltrados: 0,
    });
    fetchFacets.mockResolvedValue({ bancas: ['FGV'], assuntos: ['A'] });

    const result = await getVitrinePage({
      userId: 'user-1',
      page: 1,
      filters: { q: 'q-100' },
    });

    expect(fetchRpcPage).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      filters: { q: 'q-100' },
    });
    expect(getHistorico).not.toHaveBeenCalled();
    expect(result.facets).toEqual({ bancas: ['FGV'], assuntos: ['A'] });
  });

  it('limita questoes por grupo no fallback JS e preserva totalQuestoes agregado', async () => {
    const totalNoAssunto = SCALE_LIMITS.QUESTOES_POR_ASSUNTO + 5;
    fetchNavModulosCached.mockResolvedValue(
      Array.from({ length: totalNoAssunto }, (_, i) => ({
        id: String(i + 1),
        modulo_slug: `assunto-denso-${i + 1}`,
        modulo_nome: 'T',
        titulo_aula: 'Assunto Denso',
        banca: 'FGV',
        created_at: `2024-03-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`,
        avant_codigo: 1000 + i,
      })),
    );

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { assunto: 'Assunto Denso' },
    });

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].totalQuestoes).toBe(totalNoAssunto);
    expect(result.groups[0].questoes).toHaveLength(SCALE_LIMITS.QUESTOES_POR_ASSUNTO);
  });

  it('RPC vazio sem filtros aciona pipeline JS para reativação/matrícula', async () => {
    fetchRpcPage.mockResolvedValue({
      groups: [],
      pagination: { page: 1, perPage: 12, totalGroups: 0, totalPages: 1 },
      totalModulosFiltrados: 0,
      facets: { bancas: ['CESPE'], assuntos: ['Urgências'] },
    });
    getModulos.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'slug-a',
        modulo_nome: 'T',
        titulo_aula: 'Urgências',
        banca: 'CESPE',
        created_at: '2024-01-01',
        avant_codigo: 1,
      }
    ]);

    const result = await getVitrinePage({ userId: 'user-1', page: 1 });

    expect(getModulos).toHaveBeenCalledWith('user-1');
    expect(getHistorico).toHaveBeenCalledWith('user-1', ['slug-a']);
    expect(result.groups).toHaveLength(1);
  });

  it('admin com filtro usa nav cached em fallback JS (não catálogo inteiro)', async () => {
    fetchRpcPage.mockRejectedValue(new Error('RPC indisponível'));
    fetchNavModulosCached.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 's1',
        modulo_nome: 'T',
        titulo_aula: 'Assunto X',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: null,
      },
    ]);

    await getVitrinePage({
      userId: 'admin-u',
      page: 1,
      filters: { banca: 'FGV' },
      isAdmin: true,
    });

    expect(fetchNavModulosCached).toHaveBeenCalledWith('admin-u', { banca: 'FGV' });
    expect(getModulosCatalog).not.toHaveBeenCalled();
  });

  it('admin tenta RPC antes do fallback JS', async () => {
    fetchRpcPage.mockResolvedValue({
      groups: [{ titulo_aula: 'Aula 1', modulo_nome: 'M', banca: 'FGV', questoes: [] }],
      pagination: { page: 1, perPage: 12, totalGroups: 1, totalPages: 1 },
      totalModulosFiltrados: 1,
      facets: { bancas: ['FGV'], assuntos: [] },
    });

    await getVitrinePage({ userId: 'admin-u', page: 1, isAdmin: true });

    expect(fetchRpcPage).toHaveBeenCalledWith({
      userId: 'admin-u',
      page: 1,
      filters: {},
    });
    expect(getModulosCatalog).not.toHaveBeenCalled();
  });
});
