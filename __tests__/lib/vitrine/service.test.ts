jest.mock('@/lib/cache', () => ({
  getModulosEstudoVitrineForUserCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
}));

import {
  getModulosEstudoVitrineForUserCached,
  getHistoricoQuestoesForSlugsCached,
} from '@/lib/cache';
import { getVitrinePage } from '@/lib/vitrine/service';

const getModulos = getModulosEstudoVitrineForUserCached as jest.Mock;
const getHistorico = getHistoricoQuestoesForSlugsCached as jest.Mock;

describe('getVitrinePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getHistorico.mockResolvedValue([]);
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
    getModulos.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 's1',
        modulo_nome: 'T',
        titulo_aula: 'A',
        banca: 'FGV',
        created_at: '2024-01-01',
        avant_codigo: null,
      },
      {
        id: '2',
        modulo_slug: 's2',
        modulo_nome: 'T',
        titulo_aula: 'B',
        banca: 'CESPE',
        created_at: '2024-01-01',
        avant_codigo: null,
      },
    ]);

    const result = await getVitrinePage({
      userId: 'u',
      page: 1,
      filters: { banca: 'FGV' },
    });

    expect(result.pagination.totalGroups).toBe(1);
    expect(result.groups[0].banca).toBe('FGV');
    expect(getHistorico).toHaveBeenCalledWith('u', ['s1']);
  });
});
