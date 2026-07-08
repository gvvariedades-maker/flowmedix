import {
  inferShockDeckSlot,
  inferUrgenciasShockTrapSlot,
  shockDeckSlotLabel,
} from '@/lib/slides/urgenciasChoqueSlideUtils';

describe('urgenciasChoqueSlideUtils', () => {
  it('inferShockDeckSlot classifica tipos', () => {
    expect(inferShockDeckSlot('Segurança', 'interromper circuito')).toBe('seguranca');
    expect(inferShockDeckSlot('Choque elétrico', 'corrente energizada')).toBe('eletrico');
    expect(inferShockDeckSlot('Hipovolêmico', 'sangramento')).toBe('hipovolemico');
  });

  it('inferUrgenciasShockTrapSlot cobre pegadinhas', () => {
    expect(
      inferUrgenciasShockTrapSlot('Letra D', 'não tocar', 'circuito interrompido'),
    ).toBe('seguranca_cena');
    expect(
      inferUrgenciasShockTrapSlot('Letra B', 'RCP imediata', 'massagem cardíaca'),
    ).toBe('rcp_prematura');
    expect(
      inferUrgenciasShockTrapSlot('Transferência', 'hipovolêmico', 'fluido'),
    ).toBe('tipo_confusao');
  });

  it('expõe labels legíveis', () => {
    expect(shockDeckSlotLabel('seguranca')).toBe('Segurança');
  });
});
