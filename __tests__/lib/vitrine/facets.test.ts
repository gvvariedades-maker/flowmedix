import { buildVitrineFacets, getVitrineFacets } from '@/lib/vitrine/facets';
import type { ModuloEstudoRow } from '@/lib/vitrineFilters';

jest.mock('@/lib/cache', () => ({
  getModulosEstudoVitrineForUserCached: jest.fn(),
  getModulosEstudoCached: jest.fn(),
}));

jest.mock('@/lib/vitrine/rpc', () => ({
  fetchVitrineFacetsFromRpc: jest.fn(),
}));

import { getModulosEstudoCached, getModulosEstudoVitrineForUserCached } from '@/lib/cache';
import { fetchVitrineFacetsFromRpc } from '@/lib/vitrine/rpc';

const getModulos = getModulosEstudoVitrineForUserCached as jest.Mock;
const getModulosGlobal = getModulosEstudoCached as jest.Mock;
const fetchFacetsRpc = fetchVitrineFacetsFromRpc as jest.Mock;

const row = (partial: Partial<ModuloEstudoRow> & Pick<ModuloEstudoRow, 'modulo_slug'>): ModuloEstudoRow => ({
  id: partial.id ?? partial.modulo_slug,
  modulo_nome: partial.modulo_nome ?? null,
  titulo_aula: partial.titulo_aula ?? null,
  banca: partial.banca ?? '',
  created_at: partial.created_at ?? '2024-01-01',
  avant_codigo: partial.avant_codigo ?? null,
  ...partial,
});

describe('buildVitrineFacets', () => {
  it('lista bancas e assuntos únicos ordenados', () => {
    const facets = buildVitrineFacets([
      row({ modulo_slug: '1', banca: 'CESPE', titulo_aula: 'Z' }),
      row({ modulo_slug: '2', banca: 'FGV', titulo_aula: 'A' }),
      row({ modulo_slug: '3', banca: 'FGV', titulo_aula: 'A' }),
    ]);

    expect(facets.bancas).toEqual(['CESPE', 'FGV']);
    expect(facets.assuntos).toEqual(['A', 'Z']);
  });

  it('restringe assuntos quando banca está selecionada', () => {
    const modulos = [
      row({ modulo_slug: '1', banca: 'FGV', titulo_aula: 'Assunto FGV' }),
      row({ modulo_slug: '2', banca: 'CESPE', titulo_aula: 'Assunto CESPE' }),
    ];

    const facets = buildVitrineFacets(modulos, { banca: 'FGV' });
    expect(facets.assuntos).toEqual(['Assunto FGV']);
    expect(facets.bancas).toHaveLength(2);
  });
});

describe('getVitrineFacets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usa RPC quando disponível', async () => {
    fetchFacetsRpc.mockResolvedValue({
      bancas: ['FGV'],
      assuntos: ['Assunto FGV'],
    });

    const facets = await getVitrineFacets({ userId: 'u1', banca: 'FGV' });

    expect(fetchFacetsRpc).toHaveBeenCalledWith({ userId: 'u1', bancas: ['FGV'] });
    expect(getModulos).not.toHaveBeenCalled();
    expect(facets.assuntos).toEqual(['Assunto FGV']);
  });

  it('faz fallback JS quando RPC falha', async () => {
    fetchFacetsRpc.mockRejectedValue(new Error('RPC indisponível'));
    getModulos.mockResolvedValue([
      row({ modulo_slug: '1', banca: 'FGV', titulo_aula: 'Assunto FGV' }),
      row({ modulo_slug: '2', banca: 'CESPE', titulo_aula: 'Assunto CESPE' }),
    ]);

    const facets = await getVitrineFacets({ userId: 'u1', banca: 'FGV' });

    expect(getModulos).toHaveBeenCalledWith('u1');
    expect(facets.assuntos).toEqual(['Assunto FGV']);
  });

  it('faz fallback JS quando RPC retorna facets vazios', async () => {
    fetchFacetsRpc.mockResolvedValue({ bancas: [], assuntos: [] });
    getModulos.mockResolvedValue([
      row({ modulo_slug: '1', banca: 'FGV', titulo_aula: 'Assunto FGV' }),
      row({ modulo_slug: '2', banca: 'CESPE', titulo_aula: 'Assunto CESPE' }),
    ]);

    const facets = await getVitrineFacets({ userId: 'u1' });

    expect(facets.bancas).toEqual(['CESPE', 'FGV']);
    expect(facets.assuntos).toEqual(['Assunto CESPE', 'Assunto FGV']);
  });

  it('admin ignora RPC e usa catálogo global', async () => {
    fetchFacetsRpc.mockResolvedValue({ bancas: ['FGV'], assuntos: ['X'] });
    getModulos.mockResolvedValue([]);
    getModulosGlobal.mockResolvedValue([
      row({ modulo_slug: '1', banca: 'FGV', titulo_aula: 'Assunto FGV' }),
      row({ modulo_slug: '2', banca: 'CESPE', titulo_aula: 'Assunto CESPE' }),
    ]);

    const facets = await getVitrineFacets({ userId: 'admin-1', isAdmin: true });

    expect(fetchFacetsRpc).not.toHaveBeenCalled();
    expect(getModulosGlobal).toHaveBeenCalled();
    expect(facets.bancas).toEqual(['CESPE', 'FGV']);
    expect(facets.assuntos).toEqual(['Assunto CESPE', 'Assunto FGV']);
  });
});
