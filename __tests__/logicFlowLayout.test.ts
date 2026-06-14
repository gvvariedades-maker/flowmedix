import { resolveLogicFlowLayoutVariant } from '@/components/slides/core/logicFlowLayout';
import { LOGIC_FLOW_POOL } from '@/components/slides/core/layoutRotation';

describe('logicFlowLayout', () => {
  const threeSteps = { steps: ['1', '2', '3'] };

  it('retorna cards com 3+ passos sem override JSON nem slug', () => {
    expect(resolveLogicFlowLayoutVariant(threeSteps, undefined, undefined)).toBe('cards');
  });

  it('rotaciona horizontal/vertical/cards com slug e sem override JSON', () => {
    const result = resolveLogicFlowLayoutVariant(threeSteps, undefined, 'cards', {
      slug: 'vias-de-administracao-logic-1',
      slideIndex: 2,
    });
    expect(LOGIC_FLOW_POOL).toContain(result);
  });

  it('respeita vertical explícito no JSON', () => {
    const slide = { steps: ['1', '2', '3', '4'] };
    expect(resolveLogicFlowLayoutVariant(slide, 'vertical', 'cards')).toBe('vertical');
  });

  it('respeita cards explícito no JSON', () => {
    expect(resolveLogicFlowLayoutVariant(threeSteps, 'cards', 'vertical')).toBe('cards');
  });

  it('mantém vertical com menos de 3 passos', () => {
    const slide = { steps: ['1', '2'] };
    expect(resolveLogicFlowLayoutVariant(slide, undefined, 'vertical')).toBe('vertical');
  });

  it('override JSON tem prioridade sobre rotação por slug', () => {
    const result = resolveLogicFlowLayoutVariant(threeSteps, 'horizontal', 'cards', {
      slug: 'any-slug',
      slideIndex: 0,
    });
    expect(result).toBe('horizontal');
  });
});
