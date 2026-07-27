import {
  canEnableBandit,
  canEnableCalibration,
  canEnableFsrsAsDefaultScheduler,
  canEnableLlmRuntimeSelection,
  canExpandSkills,
  isOfflineAnnotationWithHumanReviewAllowed,
  type ExpansionGateInput,
} from '@/lib/evidence/expansionGates';

function makeInput(overrides: Partial<ExpansionGateInput> = {}): ExpansionGateInput {
  return {
    rct1UpliftConfirmed: true,
    rct1SampleSizeMet: true,
    rct2UpliftConfirmed: null,
    contaminationUnderControl: true,
    transferInventorySufficient: true,
    ...overrides,
  };
}

describe('canExpandSkills (ADR §25 Fase 6)', () => {
  it('permite expansão quando RCT-1 confirmado, amostra e contaminação sob controle', () => {
    expect(canExpandSkills(makeInput())).toBe(true);
  });

  it('bloqueia sem uplift do RCT-1', () => {
    expect(canExpandSkills(makeInput({ rct1UpliftConfirmed: false }))).toBe(false);
  });

  it('bloqueia sem amostra suficiente', () => {
    expect(canExpandSkills(makeInput({ rct1SampleSizeMet: false }))).toBe(false);
  });

  it('bloqueia com contaminação fora de controle', () => {
    expect(canExpandSkills(makeInput({ contaminationUnderControl: false }))).toBe(false);
  });

  it('não depende do RCT-2', () => {
    expect(canExpandSkills(makeInput({ rct2UpliftConfirmed: null }))).toBe(true);
  });
});

describe('canEnableCalibration', () => {
  it('exige uplift RCT-1 e inventário suficiente', () => {
    expect(canEnableCalibration(makeInput())).toBe(true);
    expect(canEnableCalibration(makeInput({ transferInventorySufficient: false }))).toBe(false);
    expect(canEnableCalibration(makeInput({ rct1UpliftConfirmed: false }))).toBe(false);
  });
});

describe('canEnableFsrsAsDefaultScheduler (ADR §12 — não promoção automática após RCT-1)', () => {
  it('bloqueia com apenas RCT-1 confirmado e RCT-2 ainda não rodado', () => {
    expect(
      canEnableFsrsAsDefaultScheduler(makeInput({ rct2UpliftConfirmed: null })),
    ).toBe(false);
  });

  it('bloqueia quando RCT-2 não teve uplift', () => {
    expect(
      canEnableFsrsAsDefaultScheduler(makeInput({ rct2UpliftConfirmed: false })),
    ).toBe(false);
  });

  it('permite somente quando ambos RCT-1 e RCT-2 confirmam uplift', () => {
    expect(
      canEnableFsrsAsDefaultScheduler(makeInput({ rct2UpliftConfirmed: true })),
    ).toBe(true);
  });
});

describe('canEnableBandit — nunca antes de ambos os RCTs (ADR §24)', () => {
  it('bloqueia sem RCT-2 confirmado', () => {
    expect(canEnableBandit(makeInput({ rct2UpliftConfirmed: null }))).toBe(false);
  });

  it('bloqueia com contaminação fora de controle mesmo com ambos RCTs confirmados', () => {
    expect(
      canEnableBandit(
        makeInput({ rct2UpliftConfirmed: true, contaminationUnderControl: false }),
      ),
    ).toBe(false);
  });

  it('permite somente com RCT-1 + RCT-2 confirmados e contaminação sob controle', () => {
    expect(canEnableBandit(makeInput({ rct2UpliftConfirmed: true }))).toBe(true);
  });
});

describe('canEnableLlmRuntimeSelection — proibido incondicionalmente (ADR §9, §24)', () => {
  it('é sempre false, sem parâmetros', () => {
    expect(canEnableLlmRuntimeSelection()).toBe(false);
  });
});

describe('isOfflineAnnotationWithHumanReviewAllowed', () => {
  it('é sempre true (anotação offline assistida por IA é permitida, publicação automática não)', () => {
    expect(isOfflineAnnotationWithHumanReviewAllowed()).toBe(true);
  });
});
