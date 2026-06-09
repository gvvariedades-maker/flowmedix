import { resolveLogicFlowRevealMode } from '@/components/slides/core/logicFlowRevealMode';

describe('logicFlowRevealMode', () => {
  it('default tap com 3+ passos', () => {
    expect(resolveLogicFlowRevealMode(4, undefined)).toBe('tap');
  });

  it('default auto com menos de 3 passos', () => {
    expect(resolveLogicFlowRevealMode(2, undefined)).toBe('auto');
  });

  it('reveal_mode explícito vence', () => {
    expect(resolveLogicFlowRevealMode(5, 'auto')).toBe('auto');
    expect(resolveLogicFlowRevealMode(1, 'tap')).toBe('tap');
  });
});
