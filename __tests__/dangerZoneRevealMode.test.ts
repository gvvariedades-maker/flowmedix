import { resolveDangerZoneRevealMode } from '@/components/slides/core/dangerZoneRevealMode';

describe('resolveDangerZoneRevealMode', () => {
  it('retorna tap por default no layout compare com correct', () => {
    expect(
      resolveDangerZoneRevealMode(
        'compare',
        [{ label: 'Trap', detail: 'X', correct: 'Certo' }],
        undefined,
      ),
    ).toBe('tap');
  });

  it('retorna auto sem items compare', () => {
    expect(
      resolveDangerZoneRevealMode('list', [{ label: 'Erro', detail: 'X' }], undefined),
    ).toBe('auto');
  });

  it('respeita reveal_mode explícito auto no compare', () => {
    expect(
      resolveDangerZoneRevealMode(
        'compare',
        [{ label: 'Trap', detail: 'X', correct: 'Certo' }],
        'auto',
      ),
    ).toBe('auto');
  });

  it('respeita reveal_mode explícito tap fora do compare', () => {
    expect(resolveDangerZoneRevealMode('list', [], 'tap')).toBe('tap');
  });
});
