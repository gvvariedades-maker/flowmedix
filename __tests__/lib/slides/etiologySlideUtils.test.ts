import {
  inferEtiologyKingdom,
  inferEtiologyIntruderKingdoms,
  extractLetterFromText,
} from '@/lib/slides/etiologySlideUtils';

describe('etiologySlideUtils', () => {
  it('inferEtiologyKingdom classifica vírus e bactérias', () => {
    expect(inferEtiologyKingdom('Dengue', 'arbovirose')).toBe('virus');
    expect(inferEtiologyKingdom('Cólera', 'Vibrio cholerae')).toBe('bacteria');
    expect(inferEtiologyKingdom('Malária', 'Plasmodium')).toBe('protozoan');
  });

  it('extractLetterFromText encontra letra no passo', () => {
    expect(extractLetterFromText('Letra B: dengue — descarta B.')).toBe('B');
  });

  it('inferEtiologyIntruderKingdoms detecta intruso viral', () => {
    const { intruder } = inferEtiologyIntruderKingdoms(
      'Letra B',
      'Dengue na lista',
      'Gabarito letra A',
    );
    expect(intruder).toContain('virus');
  });
});
