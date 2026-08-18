import {
  buildDesempenhoHref,
  buildDesempenhoHistoricoHref,
  countDesempenhoFiltrosAtivos,
  DESEMPENHO_FILTROS_LIMPOS,
  desempenhoFiltersWithArea,
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

  it('serializa assunto só com área e preserva banca', () => {
    expect(
      buildDesempenhoHref({
        periodo: '30d',
        banca: 'CPCON',
        areaId: 'farmacologia',
        disciplina: null,
        assunto: 'Vias de Administração',
      }),
    ).toBe(
      '/desempenho?periodo=30d&banca=CPCON&area=farmacologia&assunto=Vias+de+Administra%C3%A7%C3%A3o',
    );
    expect(
      buildDesempenhoHref({
        periodo: 'all',
        banca: null,
        areaId: null,
        disciplina: null,
        assunto: 'Vias de Administração',
      }),
    ).toBe('/desempenho');
  });

  it('aceita path dedicado (mapa/histórico) sem perder a query', () => {
    expect(
      buildDesempenhoHref(
        {
          periodo: '30d',
          banca: null,
          areaId: 'farmacologia',
          disciplina: null,
          assunto: 'Vias de Administração',
        },
        '/desempenho/mapa',
      ),
    ).toBe(
      '/desempenho/mapa?periodo=30d&area=farmacologia&assunto=Vias+de+Administra%C3%A7%C3%A3o',
    );
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
        banca: 'CPCON',
        areaId: 'farmacologia',
        disciplina: 'enfermagem',
        assunto: 'Vias de Administração',
      }),
    ).toBe(5);

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

describe('desempenhoFiltersWithArea', () => {
  it('zera o assunto ao trocar ou limpar a área', () => {
    const atual = {
      periodo: '30d' as const,
      banca: 'CPCON',
      areaId: 'farmacologia' as const,
      disciplina: null,
      assunto: 'Vias de Administração',
    };
    expect(desempenhoFiltersWithArea(atual, 'saude_publica').assunto).toBeNull();
    expect(desempenhoFiltersWithArea(atual, null).assunto).toBeNull();
    expect(desempenhoFiltersWithArea(atual, 'farmacologia').assunto).toBe(
      'Vias de Administração',
    );
  });
});

describe('buildDesempenhoHistoricoHref', () => {
  it('acrescenta resultado e cursor só no histórico', () => {
    expect(
      buildDesempenhoHistoricoHref(
        {
          periodo: 'all',
          banca: null,
          areaId: null,
          disciplina: null,
          assunto: null,
        },
        { resultado: 'erro', cursor: '2026-08-10T12:00:00.000Z|h1' },
      ),
    ).toBe(
      '/desempenho/historico?resultado=erro&cursor=2026-08-10T12%3A00%3A00.000Z%7Ch1',
    );
  });
});
