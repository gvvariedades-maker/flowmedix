/**
 * Rótulos visíveis do hub Meu desempenho.
 * Unidade e universo vêm de docs/DESEMPENHO_METRICAS.md — sem jargão de implementação.
 */

export const DESEMPENHO_COPY = {
  estudoRespondidasLabel: 'Questões analisadas',
  estudoMetaLabel: 'Praticadas hoje',
  estudoUniversoHint:
    'Considerando o período e os filtros selecionados. Hábitos e estudo reverso ficam na aba Atividade.',
  estudoPlacarEmpty: 'Sem questões com alternativa marcada neste período.',
  evolucaoTitle: 'Evolução das tentativas',
  evolucaoHint:
    'Acerto por dia nas tentativas registradas (horário de Brasília). Não é o mesmo conjunto do placar de questões.',
  evolucaoVsPlacarZerado:
    'O placar de questões acima está zerado. Esta curva conta tentativas registradas no período — outro conjunto, que o reset não apaga.',
  atividadeMetaLabel: 'Estudo reverso hoje',
  rankingPeriodo: 'estudo reverso · últimos 30 dias',
} as const;

export function formatEstudoAmostra(
  acertos: number,
  respondidas: number,
  confianca: string,
): string {
  return `Amostra: ${acertos}/${respondidas} questões · ${confianca}`;
}

export function formatAtividadeHistorico(total: number): string {
  return `${total} com estudo reverso · todo o histórico`;
}

export function formatAtividadeMeta(hoje: number, meta: number): string {
  return `${DESEMPENHO_COPY.atividadeMetaLabel} ${hoje}/${meta}`;
}

export function formatHeatmapTotal(total: number, periodo: number): string {
  const unidade = total === 1 ? 'questão com estudo reverso' : 'questões com estudo reverso';
  return `${total} ${unidade} nos últimos ${periodo} dias`;
}

export function formatHeatmapEmpty(): string {
  return 'Nenhuma questão com estudo reverso ainda.';
}

export function formatHeatmapCellQuestoes(count: number): string {
  return count === 1 ? '1 questão com estudo reverso' : `${count} questões com estudo reverso`;
}

export function formatRankingItemLabel(nome: string, count: number): string {
  const unidade = count === 1 ? 'questão com estudo reverso' : 'questões com estudo reverso';
  return `${nome}, ${count} ${unidade}`;
}

/** Copy de Simulados: distingue respondidas reais e tamanho da prova (sem inventar em branco). */
export function formatSimuladoAcertoContexto(
  acertos: number,
  respondidas: number,
  questoesProva: number,
): string | null {
  if (questoesProva <= 0 && respondidas <= 0) return null;
  const acertoTxt = acertos === 1 ? '1 acerto' : `${acertos} acertos`;
  const respTxt = respondidas === 1 ? '1 respondida' : `${respondidas} respondidas`;
  const provaTxt =
    questoesProva === 1 ? 'Simulado com 1 questão' : `Simulado com ${questoesProva} questões`;
  return `${acertoTxt} em ${respTxt} · ${provaTxt}`;
}
