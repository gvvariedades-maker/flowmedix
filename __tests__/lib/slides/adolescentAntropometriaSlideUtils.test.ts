import {
  inferZRailSlot,
  inferZBandId,
  parseAdolescentZStep,
  inferZTrapBands,
  extractLetterFromTrapLabel,
  zBandHighlightedMarkers,
  extractZRange,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';

describe('adolescentAntropometriaSlideUtils', () => {
  it('inferZRailSlot mapeia ferramenta, conduta e sobrepeso', () => {
    expect(inferZRailSlot('Ferramenta', 'Caderneta do Adolescente + curvas OMS')).toBe('tool');
    expect(inferZRailSlot('Caderneta + OMS', 'Gráficos da Caderneta para estatura e IMC')).toBe('tool');
    expect(inferZRailSlot('O que é o Z', 'Desvios-padrão do IMC/estatura')).toBe('metric');
    expect(inferZRailSlot('Sobrepeso', 'IMC com Z entre +1 e +2')).toBe('band_overweight');
    expect(inferZRailSlot('Conduta do TE', 'Classificar na Caderneta e orientar')).toBe('action');
    expect(inferZRailSlot('Pegadinha', 'Banca desloca ±1 DP')).toBe('pegadinha');
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

  it('extractZRange e zBandHighlightedMarkers cobrem faixas Caderneta', () => {
    expect(extractZRange('-2 ≤ Z ≤ +1')).toEqual({ low: -2, high: 1 });
    expect(extractZRange('+1 < Z ≤ +2')).toEqual({ low: 1, high: 2 });
    expect([...zBandHighlightedMarkers('eutrofia', '-2 ≤ Z ≤ +1')].sort((a, b) => a - b)).toEqual([
      -2, -1, 0, 1,
    ]);
    expect([...zBandHighlightedMarkers('sobrepeso', '+1 < Z ≤ +2')].sort((a, b) => a - b)).toEqual([
      1, 2,
    ]);
    expect([...zBandHighlightedMarkers('magreza_acentuada', 'Z < -3')]).toEqual([-3]);
  });
});
