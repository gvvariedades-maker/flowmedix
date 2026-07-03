import {
  detectColdChainMode,
  extractTempMarkers,
  inferTemperatureRowMarkers,
  inferTemperatureSlots,
  isPniTemperatureMcqCorpus,
  isPniVfColdChainCorpus,
  parsePniColdChainStep,
} from '@/lib/slides/pniSlideUtils';

describe('pniSlideUtils — cadeia de frio', () => {
  it('detecta modo V/F vs MCQ temperatura', () => {
    expect(detectColdChainMode('Registre V ( ) F ( ) de cima para baixo')).toBe('vf');
    expect(isPniVfColdChainCorpus('sequência V, F, V, F')).toBe(true);
    expect(
      detectColdChainMode('Conservação dos imunobiológicos entre 2 °C e 8 °C no refrigerador'),
    ).toBe('mcq_temp');
    expect(isPniTemperatureMcqCorpus('faixa térmica 2–8 °C')).toBe(true);
  });

  it('extrai marcadores de temperatura', () => {
    expect(extractTempMarkers('Faixa positiva de 2 °C a 8 °C')).toEqual([2, 8]);
    expect(extractTempMarkers('piso abaixo de 2 °C')).toEqual(expect.arrayContaining([0, 2]));
    expect(inferTemperatureRowMarkers('Teto', 'acima de 8 °C')).toEqual(expect.arrayContaining([8]));
  });

  it('parseia passos V/F e eliminação MCQ', () => {
    const vf = parsePniColdChainStep('I — BCG não exige agitação → V.', 0);
    expect(vf.kind).toBe('vf_judge');

    const combine = parsePniColdChainStep('Combinar sequência V, F, V, F → letra C.', 3);
    expect(combine.kind).toBe('vf_combine');

    const anchor = parsePniColdChainStep('Decore: temperatura positiva = 2 °C a 8 °C.', 0);
    expect(anchor.kind).toBe('temp_anchor');
    expect(anchor.markers).toEqual(expect.arrayContaining([2, 8]));

    const elim = parsePniColdChainStep('Eliminar A: piso abaixo de 2 °C.', 1);
    expect(elim.kind).toBe('eliminate');
    expect(elim.letter).toBe('A');

    const locate = parsePniColdChainStep('Marcar B: única faixa 2–8 °C.', 2);
    expect(locate.kind).toBe('locate');
    expect(locate.letter).toBe('B');
  });

  it('infere slots de trilho no danger_zone', () => {
    const slots = inferTemperatureSlots(
      'Letra A — abaixo de 2 °C',
      'piso errado',
      'Faixa positiva = 2 a 8 °C',
    );
    expect(slots.hasRail).toBe(true);
    expect(slots.trapMarkers).toEqual(expect.arrayContaining([0, 2]));
    expect(slots.correctMarkers).toEqual(expect.arrayContaining([2, 8]));
  });
});
