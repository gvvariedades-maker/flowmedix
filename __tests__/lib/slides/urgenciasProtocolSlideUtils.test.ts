import {
  inferExcetoRailSlot,
  inferUrgenciasExcetoTrapSlot,
  excetoRailSlotLabel,
  urgenciasExcetoTrapSlotLabel,
} from '@/lib/slides/urgenciasExcetoSlideUtils';
import {
  inferProtocolDeckSlot,
  inferUrgenciasProtocolTrapSlot,
  inferVfChipFromText,
  protocolDeckSlotLabel,
  urgenciasProtocolTrapSlotLabel,
} from '@/lib/slides/urgenciasProtocolSlideUtils';

describe('urgenciasExcetoSlideUtils', () => {
  it('inferExcetoRailSlot — comando EXCETO', () => {
    expect(inferExcetoRailSlot('Comando', 'Assinale a alternativa incorreta')).toBe('comando');
    expect(excetoRailSlotLabel('comando')).toBe('Comando');
  });

  it('inferExcetoRailSlot — exceção reposicionar', () => {
    expect(
      inferExcetoRailSlot('Imobilização', 'Não forçar reposicionamento da fratura exposta'),
    ).toBe('excecao');
  });

  it('inferUrgenciasExcetoTrapSlot — reposicionar à força', () => {
    const slot = inferUrgenciasExcetoTrapSlot(
      'Reposicionar fratura',
      'Alinhar osso à força',
      'Imobilizar sem forçar',
    );
    expect(slot).toBe('reposicionar_forca');
    expect(urgenciasExcetoTrapSlotLabel(slot)).toBe('Reposicionar');
  });
});

describe('urgenciasProtocolSlideUtils', () => {
  it('inferProtocolDeckSlot — V/F item', () => {
    expect(inferProtocolDeckSlot('Afirmativa II', 'FALSA — agitar vacina')).toBe('vf_item');
    expect(protocolDeckSlotLabel('vf_item')).toBe('V/F');
  });

  it('inferVfChipFromText', () => {
    expect(inferVfChipFromText('VERDADEIRA — epinefrina IM')).toBe('V');
    expect(inferVfChipFromText('falsa conduta')).toBe('F');
  });

  it('inferUrgenciasProtocolTrapSlot — pasta caseira', () => {
    const slot = inferUrgenciasProtocolTrapSlot(
      'Pasta de dente',
      'Aplicar na queimadura',
      'Resfriar com água corrente',
    );
    expect(slot).toBe('primeiro_socorro');
    expect(urgenciasProtocolTrapSlotLabel(slot)).toBe('1º socorro');
  });

  it('inferUrgenciasProtocolTrapSlot — epinefrina IV', () => {
    const slot = inferUrgenciasProtocolTrapSlot(
      'Epinefrina IV',
      'Primeira linha anafilaxia',
      'IM na coxa imediatamente',
    );
    expect(slot).toBe('via_timing');
  });
});
