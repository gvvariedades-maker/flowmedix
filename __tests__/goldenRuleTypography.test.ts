import {
  getCompareBackFaceLabel,
  getCompareCorrectColumnTitle,
  getGoldenRuleTitleSizeClass,
} from '@/lib/slides/goldenRuleTypography';
import {
  getLogicFlowStepVisual,
  logicFlowCardsGridClass,
} from '@/components/slides/core/logicFlowStepStyles';

describe('goldenRuleTypography', () => {
  it('escala fonte curta para tamanho grande', () => {
    expect(getGoldenRuleTitleSizeClass('Regra curta')).toContain('xl:text-5xl');
  });

  it('escala fonte média para tamanho médio', () => {
    const medium = 'word '.repeat(20).trim();
    expect(getGoldenRuleTitleSizeClass(medium)).toContain('lg:text-3xl');
    expect(getGoldenRuleTitleSizeClass(medium)).not.toContain('xl:text-5xl');
  });

  it('reduz escala quando palavra única é muito longa', () => {
    const longWord = 'DESCONTAMINAÇÃO';
    expect(getGoldenRuleTitleSizeClass(longWord)).toContain('lg:text-2xl');
    expect(getGoldenRuleTitleSizeClass(longWord)).not.toContain('xl:text-5xl');
  });

  it('escala fonte longa para tamanho compacto', () => {
    const long = 'A'.repeat(200);
    expect(getGoldenRuleTitleSizeClass(long)).toContain('lg:text-2xl');
  });

  it('compare: evita repetir letra quando correct traz gabarito', () => {
    expect(
      getCompareCorrectColumnTitle('Letra A', 'Gabarito: letra B — V, V, F, F, V, V.'),
    ).toBe('Resposta certa');
  });

  it('compare back face: distrator usa conduta, gabarito usa resposta certa', () => {
    expect(getCompareBackFaceLabel('Letra A — fosfato', 'Diluição compatível = SF 0,9%.')).toBe(
      'Conduta certa na prova',
    );
    expect(getCompareBackFaceLabel('Letra B — gabarito', 'Monitorar pH e ajustar dose.')).toBe(
      'Resposta certa',
    );
  });
});

describe('logicFlowStepStyles', () => {
  it('destaca passo atual no modo auto', () => {
    const visual = getLogicFlowStepVisual(true, false, false, true);
    expect(visual.isCurrent).toBe(true);
    expect(visual.isPast).toBe(false);
  });

  it('marca passos anteriores como past', () => {
    const visual = getLogicFlowStepVisual(true, false, false, false);
    expect(visual.isPast).toBe(true);
    expect(visual.isCurrent).toBe(false);
  });

  it('grid cards usa 2 colunas com passos longos', () => {
    const steps = ['x', 'y', 'z'.repeat(90)];
    expect(logicFlowCardsGridClass(4, steps)).toContain('sm:grid-cols-2');
    expect(logicFlowCardsGridClass(4, steps)).not.toContain('lg:grid-cols-4');
  });
});
