import {
  inferZRailSlot,
  inferZBandId,
  parseAdolescentZStep,
  inferZTrapBands,
  extractLetterFromTrapLabel,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';

describe('adolescentAntropometriaSlideUtils', () => {
  it('inferZRailSlot mapeia ferramenta e sobrepeso', () => {
    expect(inferZRailSlot('Ferramenta', 'Caderneta do Adolescente + curvas OMS')).toBe('tool');
    expect(inferZRailSlot('Sobrepeso', 'IMC com Z entre +1 e +2')).toBe('band_overweight');
  });

  it('inferZBandId identifica faixas da Caderneta', () => {
    expect(inferZBandId('Sobrepeso', '+1 < Z ≤ +2')).toBe('sobrepeso');
    expect(inferZBandId('Obesidade grave', 'Z > +3')).toBe('obesidade_grave');
  });

  it('parseAdolescentZStep classifica eliminação e gabarito', () => {
    const eliminate = parseAdolescentZStep('B: +2 a +3 como obesidade grave → falsa → elimina.', 1);
    expect(eliminate.kind).toBe('eliminate');
    expect(eliminate.letter).toBe('B');

    const mark = parseAdolescentZStep('Marcar A.', 5);
    expect(mark.kind).toBe('mark');
    expect(mark.letter).toBe('A');
  });

  it('inferZTrapBands posiciona distrator e correção', () => {
    const bands = inferZTrapBands(
      'Rotula obesidade grave numa faixa +2 a +3',
      'Z entre +2 e +3 = obesidade; grave = Z > +3',
    );
    expect(bands.trapPosition).toBeGreaterThan(1);
    expect(bands.correctPosition).toBeGreaterThan(bands.trapPosition);
  });

  it('extractLetterFromTrapLabel lê letra do label', () => {
    expect(extractLetterFromTrapLabel('Letra B — obesidade grave')).toBe('B');
  });
});
