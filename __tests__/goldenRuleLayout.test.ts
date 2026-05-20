import {
  goldenRuleHasTableRows,
  resolveGoldenRuleLayoutVariant,
} from '@/components/slides/core/goldenRuleLayout';

describe('goldenRuleLayout', () => {
  it('retorna center sem rows', () => {
    expect(resolveGoldenRuleLayoutVariant(undefined, undefined)).toBe('center');
    expect(resolveGoldenRuleLayoutVariant({ rows: [] }, undefined)).toBe('center');
  });

  it('retorna reference_table quando há rows válidas', () => {
    const slide = {
      rows: [{ label: 'FC', value: '60–100' }],
    };
    expect(resolveGoldenRuleLayoutVariant(slide, undefined)).toBe('reference_table');
    expect(resolveGoldenRuleLayoutVariant(slide, 'center')).toBe('reference_table');
  });

  it('respeita override tipográfico explícito', () => {
    const slide = {
      rows: [{ label: 'FC', value: '60–100' }],
    };
    expect(resolveGoldenRuleLayoutVariant(slide, 'minimal')).toBe('minimal');
  });

  it('goldenRuleHasTableRows detecta par label/value', () => {
    expect(goldenRuleHasTableRows([{ label: 'PAS', value: '90' }])).toBe(true);
    expect(goldenRuleHasTableRows([{ label: '', value: 'x' }])).toBe(false);
  });
});
