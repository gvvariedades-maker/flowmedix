import {
  assignMeasurementWindow,
  assignRct1Arm,
  computeArmAssignmentId,
  computeHoldoutAssignmentId,
  computeMeasurementWindowAssignmentId,
  computeUplift14d,
  filterOutMeasurementPool,
  isQuestionInMeasurementPool,
} from '@/lib/evidence/rct1';

describe('computeArmAssignmentId / assignRct1Arm — determinismo (ADR §19)', () => {
  it('mesmo (user_id, experiment_id) sempre produz o mesmo arm_assignment_id', () => {
    const a = computeArmAssignmentId('user-1', 'exp-rct1');
    const b = computeArmAssignmentId('user-1', 'exp-rct1');
    expect(a).toBe(b);
  });

  it('usuários diferentes tendem a produzir ids diferentes', () => {
    const a = computeArmAssignmentId('user-1', 'exp-rct1');
    const b = computeArmAssignmentId('user-2', 'exp-rct1');
    expect(a).not.toBe(b);
  });

  it('assignRct1Arm é determinístico para o mesmo input', () => {
    const first = assignRct1Arm('user-42', 'exp-rct1');
    const second = assignRct1Arm('user-42', 'exp-rct1');
    expect(first).toEqual(second);
    expect(['control', 'treatment']).toContain(first.arm);
  });

  it('treatmentRatioPercent=100 sempre atribui treatment; 0 sempre atribui control', () => {
    expect(assignRct1Arm('user-x', 'exp-rct1', 100).arm).toBe('treatment');
    expect(assignRct1Arm('user-x', 'exp-rct1', 0).arm).toBe('control');
  });

  it('produz uma distribuição plausível entre os braços em uma amostra grande', () => {
    let treatmentCount = 0;
    const sampleSize = 500;
    for (let i = 0; i < sampleSize; i += 1) {
      const { arm } = assignRct1Arm(`user-${i}`, 'exp-rct1', 50);
      if (arm === 'treatment') treatmentCount += 1;
    }
    const ratio = treatmentCount / sampleSize;
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.7);
  });
});

describe('computeMeasurementWindowAssignmentId / assignMeasurementWindow (ADR §14–§15)', () => {
  it('é determinístico para o mesmo (user, skill, experiment)', () => {
    const a = computeMeasurementWindowAssignmentId('user-1', 'skill-a', 'exp-rct1');
    const b = computeMeasurementWindowAssignmentId('user-1', 'skill-a', 'exp-rct1');
    expect(a).toBe(b);
  });

  it('onlyPrimaryD14 força d14 independente do hash', () => {
    const result = assignMeasurementWindow('user-1', 'skill-a', 'exp-rct1', {
      onlyPrimaryD14: true,
    });
    expect(result.window).toBe('d14');
  });

  it('sem onlyPrimaryD14, retorna uma das três janelas válidas de forma determinística', () => {
    const first = assignMeasurementWindow('user-9', 'skill-b', 'exp-rct1');
    const second = assignMeasurementWindow('user-9', 'skill-b', 'exp-rct1');
    expect(first).toEqual(second);
    expect(['d7', 'd14', 'd30']).toContain(first.window);
  });

  it('pesos default priorizam fortemente d14 em amostra grande', () => {
    const counts: Record<string, number> = { d7: 0, d14: 0, d30: 0 };
    for (let i = 0; i < 300; i += 1) {
      const { window } = assignMeasurementWindow(`user-${i}`, 'skill-c', 'exp-rct1');
      counts[window] += 1;
    }
    expect(counts.d14).toBeGreaterThan(counts.d7);
    expect(counts.d14).toBeGreaterThan(counts.d30);
  });
});

describe('computeHoldoutAssignmentId (ADR §15, §19)', () => {
  it('é determinístico e varia com holdout_version (substituição auditável)', () => {
    const windowAssignmentId = computeMeasurementWindowAssignmentId('user-1', 'skill-a', 'exp-rct1');
    const v1 = computeHoldoutAssignmentId(windowAssignmentId, 'd14', 'v1');
    const v1Again = computeHoldoutAssignmentId(windowAssignmentId, 'd14', 'v1');
    const v2 = computeHoldoutAssignmentId(windowAssignmentId, 'd14', 'v2');
    expect(v1).toBe(v1Again);
    expect(v1).not.toBe(v2);
  });
});

describe('measurement_pool isolation (ADR §14, §16)', () => {
  it('isQuestionInMeasurementPool detecta pertencimento ao pool', () => {
    const pool = new Set(['q-1', 'q-2']);
    expect(isQuestionInMeasurementPool('q-1', pool)).toBe(true);
    expect(isQuestionInMeasurementPool('q-3', pool)).toBe(false);
  });

  it('filterOutMeasurementPool exclui apenas o pool, preservando o restante', () => {
    const pool = new Set(['q-1']);
    const items = [{ question_id: 'q-1' }, { question_id: 'q-2' }, { question_id: 'q-3' }];
    expect(filterOutMeasurementPool(items, pool)).toEqual([
      { question_id: 'q-2' },
      { question_id: 'q-3' },
    ]);
  });
});

describe('computeUplift14d (ADR §20, §22)', () => {
  it('calcula uplift positivo quando tratamento supera controle', () => {
    const result = computeUplift14d({
      controlCorrectCount: 40,
      controlTotal: 100,
      treatmentCorrectCount: 55,
      treatmentTotal: 100,
    });
    expect(result.controlRate).toBeCloseTo(0.4);
    expect(result.treatmentRate).toBeCloseTo(0.55);
    expect(result.uplift).toBeCloseTo(0.15);
  });

  it('retorna 0 para taxas quando total é 0 (sem dividir por zero)', () => {
    const result = computeUplift14d({
      controlCorrectCount: 0,
      controlTotal: 0,
      treatmentCorrectCount: 0,
      treatmentTotal: 0,
    });
    expect(result.controlRate).toBe(0);
    expect(result.treatmentRate).toBe(0);
    expect(result.uplift).toBe(0);
  });
});
