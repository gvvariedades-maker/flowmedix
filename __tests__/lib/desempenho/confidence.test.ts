import {
  canRankBySample,
  classifyDesempenhoConfidence,
  desempenhoConfidenceId,
  getConfidenceLevel,
} from '@/lib/desempenho/confidence';

describe('classifyDesempenhoConfidence', () => {
  it.each([
    [0, 'sem_dados'],
    [1, 'dados_iniciais'],
    [2, 'dados_iniciais'],
    [3, 'tendencia_inicial'],
    [4, 'tendencia_inicial'],
    [5, 'evidencia_moderada'],
    [9, 'evidencia_moderada'],
    [10, 'diagnostico_confiavel'],
    [250, 'diagnostico_confiavel'],
  ])('amostra %i → %s', (respondidas, expected) => {
    expect(classifyDesempenhoConfidence(respondidas).id).toBe(expected);
    expect(desempenhoConfidenceId(respondidas)).toBe(expected);
  });

  it('não permite tom conclusivo nem rank abaixo de 5 questões', () => {
    for (const n of [0, 1, 2, 3, 4]) {
      const level = classifyDesempenhoConfidence(n);
      expect(level.conclusiveTone).toBe(false);
      expect(level.canRank).toBe(false);
      expect(level.canDiagnose).toBe(false);
      expect(canRankBySample(n)).toBe(false);
    }
  });

  it('libera rank e diagnóstico a partir de 5 questões', () => {
    for (const n of [5, 9, 10, 40]) {
      const level = classifyDesempenhoConfidence(n);
      expect(level.conclusiveTone).toBe(true);
      expect(level.canRank).toBe(true);
      expect(level.canDiagnose).toBe(true);
      expect(canRankBySample(n)).toBe(true);
    }
  });

  it('normaliza entrada inválida para sem_dados', () => {
    expect(classifyDesempenhoConfidence(-3).id).toBe('sem_dados');
    expect(classifyDesempenhoConfidence(Number.NaN).id).toBe('sem_dados');
    expect(classifyDesempenhoConfidence(2.9).id).toBe('dados_iniciais');
  });

  it('expõe rótulo e descrição estáveis por id', () => {
    expect(getConfidenceLevel('evidencia_moderada').label).toBe('Evidência moderada');
    expect(getConfidenceLevel('sem_dados').label).toBe('Sem dados');
    expect(getConfidenceLevel('dados_iniciais').description).toMatch(/Poucas questões/);
  });
});
