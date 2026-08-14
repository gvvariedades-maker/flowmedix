import {
  DESEMPENHO_COPY,
  formatAtividadeHistorico,
  formatAtividadeMeta,
  formatHeatmapEmpty,
  formatHeatmapTotal,
  formatRankingItemLabel,
  formatSimuladoAcertoContexto,
} from '@/components/dashboard/desempenho/desempenhoCopy';

describe('desempenhoCopy', () => {
  it('distingue Estudo (recorte) de Atividade (reverso all-time)', () => {
    expect(DESEMPENHO_COPY.estudoRespondidasLabel).toBe('Questões analisadas');
    expect(DESEMPENHO_COPY.estudoMetaLabel).toBe('Praticadas hoje');
    expect(DESEMPENHO_COPY.atividadeMetaLabel).toBe('Estudo reverso hoje');
    expect(DESEMPENHO_COPY.estudoUniversoHint).toMatch(
      /Considerando o período e os filtros selecionados/,
    );
    expect(formatAtividadeHistorico(108)).toBe(
      '108 com estudo reverso · todo o histórico',
    );
    expect(formatHeatmapTotal(11, 30)).toBe(
      '11 questões com estudo reverso nos últimos 30 dias',
    );
    expect(formatRankingItemLabel('Infecções Sexualmente Transmissíveis', 4)).toBe(
      'Infecções Sexualmente Transmissíveis, 4 questões com estudo reverso',
    );
  });

  it('qualifica a meta do dia por aba', () => {
    expect(formatAtividadeMeta(3, 10)).toBe('Estudo reverso hoje 3/10');
    expect(DESEMPENHO_COPY.estudoMetaLabel).not.toBe(DESEMPENHO_COPY.atividadeMetaLabel);
  });

  it('monta o contexto de Simulados sem inventar em branco', () => {
    expect(formatSimuladoAcertoContexto(0, 2, 10)).toBe(
      '0 acertos em 2 respondidas · Simulado com 10 questões',
    );
    expect(formatSimuladoAcertoContexto(1, 2, 10)).toBe(
      '1 acerto em 2 respondidas · Simulado com 10 questões',
    );
    expect(formatSimuladoAcertoContexto(0, 0, 0)).toBeNull();
    expect(formatHeatmapEmpty()).toBe('Nenhuma questão com estudo reverso ainda.');
  });
});
