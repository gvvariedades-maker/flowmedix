import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  resolveSoftLensExamHint,
  softLensHintLeaksCalcProfile,
} from '@/lib/slides/softLensHints';

describe('softLensHints', () => {
  const letterARow: GoldenRuleRow = {
    label: 'Letra A',
    value: 'Falsa: I e II, apenas.',
    emphasis: 'alert',
    badge: 'warn',
  };

  it('perfil via: Letra A não vaza dica de Cálculos/insulina', () => {
    const hint = resolveSoftLensExamHint(letterARow, 'via');
    expect(softLensHintLeaksCalcProfile(hint, 'via')).toBe(false);
    expect(hint).not.toMatch(/U-100|gotas|insulina/i);
  });

  it('perfil calc: Letra A pode citar U-100', () => {
    const hint = resolveSoftLensExamHint(letterARow, 'calc');
    expect(hint).toMatch(/U-100/i);
  });

  it('row.exam_hint tem prioridade sobre inferência', () => {
    const hint = resolveSoftLensExamHint(
      { ...letterARow, exam_hint: 'Dica explícita da questão SC.' },
      'calc',
    );
    expect(hint).toBe('Dica explícita da questão SC.');
  });

  it('perfil none não inventa U-100 para Letra A', () => {
    const hint = resolveSoftLensExamHint(letterARow, 'none');
    expect(hint).not.toMatch(/U-100/i);
  });

  it('perfil adolescent: sigilo não vaza dica de Cálculos', () => {
    const row: GoldenRuleRow = {
      label: 'Sigilo absoluto zero',
      value: 'Falso — há critérios legais',
      emphasis: 'alert',
    };
    const hint = resolveSoftLensExamHint(row, 'adolescent');
    expect(softLensHintLeaksCalcProfile(hint, 'adolescent')).toBe(false);
    expect(hint).toMatch(/sigilo|ECA/i);
  });
});
