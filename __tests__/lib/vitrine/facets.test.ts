import { buildVitrineFacets } from '@/lib/vitrine/facets';
import type { ModuloEstudoRow } from '@/lib/vitrineFilters';

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
