import { softLensEmphasisToTone } from '@/components/slides/variants/GoldenRuleSoftLensBoard';

describe('softLensEmphasisToTone (Onda 5)', () => {
  it('mapeia emphasis SoftLens → BoardTone', () => {
    expect(softLensEmphasisToTone('alert')).toBe('barrier');
    expect(softLensEmphasisToTone('success')).toBe('teal');
    expect(softLensEmphasisToTone('highlight')).toBe('rights');
    expect(softLensEmphasisToTone('default')).toBe('neutral');
    expect(softLensEmphasisToTone(undefined)).toBe('neutral');
  });
});
