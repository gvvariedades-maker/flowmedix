import { enhanceGoldenRuleRows } from '@/components/slides/core/goldenRuleRowsEnhance';

describe('goldenRuleRowsEnhance', () => {
  it('adiciona emphasis success e badge hot em linha de gabarito', () => {
    const rows = enhanceGoldenRuleRows([
      { label: 'Letra B — gabarito', value: 'Alternativa correta' },
    ]);
    expect(rows[0]?.emphasis).toBe('success');
    expect(rows[0]?.badge).toBe('hot');
  });

  it('não sobrescreve badge e emphasis já definidos', () => {
    const rows = enhanceGoldenRuleRows([
      { label: 'X', value: 'Y', emphasis: 'alert', badge: 'info' },
    ]);
    expect(rows[0]).toEqual({ label: 'X', value: 'Y', emphasis: 'alert', badge: 'info' });
  });
});
