import { softLensEmphasisToTone } from '@/components/slides/variants/GoldenRuleSoftLensBoard';

describe('softLensEmphasisToTone (Onda 5)', () => {
  it('mapeia emphasis SoftLens → BoardTone', () => {
    expect(softLensEmphasisToTone('alert')).toBe('exception');
    expect(softLensEmphasisToTone('success')).toBe('keep');
    expect(softLensEmphasisToTone('highlight')).toBe('command');
    expect(softLensEmphasisToTone('default')).toBe('warn');
    expect(softLensEmphasisToTone(undefined)).toBe('neutral');
  });
});
