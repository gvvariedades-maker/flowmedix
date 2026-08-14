import {
  buildDesempenhoHref,
  countDesempenhoFiltrosAtivos,
  DESEMPENHO_FILTROS_LIMPOS,
} from '@/lib/desempenho/filtersHref';

describe('buildDesempenhoHref', () => {
  it('sem filtro ativo volta para a URL limpa', () => {
    expect(buildDesempenhoHref(DESEMPENHO_FILTROS_LIMPOS)).toBe('/desempenho');
  });

  it('omite periodo=all na URL (default implícito)', () => {
    expect(
      buildDesempenhoHref({
        periodo: 'all',
        banca: 'CPCON',
        areaId: null,
        disciplina: null,
      }),
    ).toBe('/desempenho?banca=CPCON');
  });

  it('serializa período, banca, área e disciplina', () => {
    expect(
      buildDesempenhoHref({
        periodo: '30d',
        banca: 'CPCON',
        areaId: 'farmacologia',
        disciplina: 'enfermagem',
      }),
    ).toBe('/desempenho?periodo=30d&banca=CPCON&area=farmacologia&disciplina=enfermagem');
  });

  it('escapa valor com espaço e acento', () => {
    expect(
      buildDesempenhoHref({
        periodo: 'all',
        banca: 'Instituto Águia',
        areaId: null,
        disciplina: null,
      }),
    ).toBe('/desempenho?banca=Instituto+%C3%81guia');
  });
});

describe('countDesempenhoFiltrosAtivos', () => {
  it('não conta o default', () => {
    expect(countDesempenhoFiltrosAtivos(DESEMPENHO_FILTROS_LIMPOS)).toBe(0);
  });

  it('conta um por dimensão ativa', () => {
    expect(
      countDesempenhoFiltrosAtivos({
        periodo: '7d',
        banca: 'CPCON',
        areaId: 'farmacologia',
        disciplina: 'enfermagem',
      }),
    ).toBe(4);

    expect(
      countDesempenhoFiltrosAtivos({
        periodo: '7d',
        banca: null,
        areaId: null,
        disciplina: null,
      }),
    ).toBe(1);
  });
});
