import { resolveLogicFlowLayoutVariant } from '@/components/slides/core/logicFlowLayout';

describe('logicFlowLayout', () => {
  it('retorna cards com 3+ passos sem override JSON', () => {
    const slide = { steps: ['1', '2', '3'] };
    expect(resolveLogicFlowLayoutVariant(slide, undefined, 'vertical')).toBe('cards');
  });

  it('respeita vertical explícito no JSON', () => {
    const slide = { steps: ['1', '2', '3', '4'] };
    expect(resolveLogicFlowLayoutVariant(slide, 'vertical', 'cards')).toBe('vertical');
  });

  it('mantém vertical com menos de 3 passos', () => {
    const slide = { steps: ['1', '2'] };
    expect(resolveLogicFlowLayoutVariant(slide, undefined, 'vertical')).toBe('vertical');
  });
});
