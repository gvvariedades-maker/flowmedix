import {
  DESEMPENHO_COPY,
  formatAreasResumo,
  formatAtividadeHistorico,
  formatAtividadeMeta,
  formatHeatmapEmpty,
  formatHeatmapTotal,
  formatMenorDesempenhoFaixa,
  formatRankingItemLabel,
  formatSimuladoAcertoContexto,
  formatVerTodosFocos,
  formatExibindoQuestoes,
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

  it('resume o mapa da home curta e os atalhos de expansão', () => {
    expect(formatAreasResumo(8, 3)).toBe('8 áreas · 3 com diagnóstico confiável');
    expect(formatAreasResumo(1, 1)).toBe('1 área · 1 com diagnóstico confiável');
    expect(formatMenorDesempenhoFaixa('Clínico crítico')).toBe(
      'Menor desempenho: Clínico crítico',
    );
    expect(formatVerTodosFocos(5)).toBe('Ver todos os focos (5)');
    expect(DESEMPENHO_COPY.verHistorico).toBe('Ver histórico');
    expect(DESEMPENHO_COPY.verDetalhes).toBe('Ver detalhes');
    expect(DESEMPENHO_COPY.verMapaCompleto).toBe('Ver mapa completo');
    expect(formatExibindoQuestoes(12, 18)).toBe('Exibindo 12 de 18 questões');
    expect(formatExibindoQuestoes(18, 18)).toBe('Exibindo 18 de 18 questões');
    expect(formatExibindoQuestoes(18, 18, true)).toBe(
      '18 questões correspondem aos filtros na amostra das 5.000 mais recentes.',
    );
    expect(formatExibindoQuestoes(1, 18, true)).toBe(
      '1 questão corresponde aos filtros na amostra das 5.000 mais recentes.',
    );
  });
});
