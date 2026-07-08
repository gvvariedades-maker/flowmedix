import {
  chokingDeckSlotLabel,
  inferChokingDeckSlot,
  inferUrgenciasChokingTrapSlot,
} from '@/lib/slides/urgenciasEngasgoSlideUtils';

describe('urgenciasEngasgoSlideUtils', () => {
  it('inferChokingDeckSlot classifica fases', () => {
    expect(inferChokingDeckSlot('Sinal', 'mãos ao pescoço')).toBe('sinal');
    expect(inferChokingDeckSlot('Heimlich', 'compressões abdominais')).toBe('heimlich');
    expect(inferChokingDeckSlot('Lactente', 'tapas nas costas')).toBe('lactente');
  });

  it('inferUrgenciasChokingTrapSlot cobre pegadinhas', () => {
    expect(
      inferUrgenciasChokingTrapSlot('Letra C', 'abdome', 'socorrista comprime abdome'),
    ).toBe('sinal_vs_manobra');
    expect(
      inferUrgenciasChokingTrapSlot('Letra E', 'pescoço', 'sinal universal'),
    ).toBe('local_corpo');
    expect(
      inferUrgenciasChokingTrapSlot('Transferência', 'Heimlich', 'manobra sequência'),
    ).toBe('transferencia');
  });

  it('expõe labels legíveis', () => {
    expect(chokingDeckSlotLabel('sinal')).toBe('Sinal');
  });
});
