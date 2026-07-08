import {
  inferPediatricRcpDeckSlot,
  inferUrgenciasPediatricTrapSlot,
  pediatricRcpDeckSlotLabel,
} from '@/lib/slides/urgenciasPediatricSlideUtils';

describe('urgenciasPediatricSlideUtils', () => {
  it('inferPediatricRcpDeckSlot classifica eixos pediátricos', () => {
    expect(inferPediatricRcpDeckSlot('Proporção', '15:2 dois socorristas')).toBe('proporcao');
    expect(inferPediatricRcpDeckSlot('Profundidade', 'terço do diâmetro AP')).toBe('profundidade');
    expect(inferPediatricRcpDeckSlot('Frequência', '100–120/min')).toBe('frequencia');
  });

  it('inferUrgenciasPediatricTrapSlot cobre pegadinhas', () => {
    expect(
      inferUrgenciasPediatricTrapSlot('Letra A', '30:2', 'proporção adulta'),
    ).toBe('proporcao_adulta');
    expect(
      inferUrgenciasPediatricTrapSlot('Letra C', '15:2', 'metade do tórax'),
    ).toBe('proporcao_certa_prof_errada');
    expect(
      inferUrgenciasPediatricTrapSlot('Transferência', 'adulto 30:2', 'não inverter'),
    ).toBe('transferencia_adulto');
  });

  it('expõe labels legíveis', () => {
    expect(pediatricRcpDeckSlotLabel('proporcao')).toBe('15:2');
  });
});
