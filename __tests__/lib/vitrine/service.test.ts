jest.mock('@/lib/cache', () => ({
  getModulosEstudoVitrineForUserCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  fetchAccessibleModulosForNav: jest.fn(),
}));

jest.mock('@/lib/vitrine/rpc', () => ({
  fetchVitrinePageFromRpc: jest.fn(),
}));

import {
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';
import { getVitrinePage } from '@/lib/vitrine/service';

const getModulos = getModulosEstudoVitrineForUserCached as jest.Mock;
const getHistorico = getHistoricoQuestoesForSlugsCached as jest.Mock;
const fetchNavModulos = fetchAccessibleModulosForNav as jest.Mock;
const fetchRpcPage = fetchVitrinePageFromRpc as jest.Mock;

describe('getVitrinePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getHistorico.mockResolvedValue([]);
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
    fetchNavModulos.mockResolvedValue([
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

    expect(fetchNavModulos).toHaveBeenCalledWith('u', { banca: 'FGV' });
    expect(getModulos).not.toHaveBeenCalled();
    expect(result.pagination.totalGroups).toBe(1);
    expect(result.groups[0].banca).toBe('FGV');
    expect(getHistorico).toHaveBeenCalledWith('u', ['s1']);
  });

  it('usa fetchAccessibleModulosForNav quando assunto está na URL', async () => {
    fetchNavModulos.mockResolvedValue([
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

    expect(fetchNavModulos).toHaveBeenCalledWith('u', { titulo_aula: 'Assunto X' });
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
    });

    const result = await getVitrinePage({ userId: 'user-1', page: 1 });

    expect(fetchRpcPage).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      filters: {},
    });
    expect(getHistorico).not.toHaveBeenCalled();
    expect(result.groups).toHaveLength(1);
    expect(result.facets).toEqual({ bancas: [], assuntos: [] });
  });

  it('mantém pipeline JS quando há filtro q', async () => {
    getModulos.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'q-100',
        modulo_nome: 'T',
        titulo_aula: 'Assunto 1',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: 100,
      },
    ]);

    await getVitrinePage({
      userId: 'user-1',
      page: 1,
      filters: { q: 'q-100' },
    });

    expect(fetchRpcPage).not.toHaveBeenCalled();
    expect(getHistorico).toHaveBeenCalled();
  });
});
