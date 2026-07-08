import {
  inferUrgenciasRcpTrapSlot,
  inferUrgenciasSurvivalLink,
  urgenciasRcpTrapSlotLabel,
  urgenciasSurvivalLinkLabel,
} from '@/lib/slides/urgenciasSlideUtils';

describe('urgenciasSlideUtils', () => {
  it('inferUrgenciasSurvivalLink classifica elos da cadeia', () => {
    expect(inferUrgenciasSurvivalLink('Reconhecimento PCR', 'inconsciência + sem respiração')).toBe(
      'reconhecimento',
    );
    expect(inferUrgenciasSurvivalLink('Acionar 192', 'SAMU e pedir DEA')).toBe('acionamento');
    expect(inferUrgenciasSurvivalLink('Compressões', '100–120/min profundidade 5–6 cm')).toBe(
      'compressao',
    );
    expect(inferUrgenciasSurvivalLink('Ventilação 30:2', 'dois socorristas')).toBe('ventilacao');
    expect(inferUrgenciasSurvivalLink('DEA', 'desfibrilador assim que disponível')).toBe('dea');
    expect(inferUrgenciasSurvivalLink('Pós-RCP', 'verificar pulso após 2 min')).toBe('pos_rcp');
  });

  it('inferUrgenciasRcpTrapSlot cobre pegadinhas distintas', () => {
    expect(
      inferUrgenciasRcpTrapSlot(
        'Pulso a cada ciclo',
        'parar compressões todo ciclo',
        'verificar após ~2 min',
      ),
    ).toBe('pulso_intervalo');
    expect(
      inferUrgenciasRcpTrapSlot('80–100/min', 'faixa inferior', '100–120 compressões/min'),
    ).toBe('frequencia');
    expect(
      inferUrgenciasRcpTrapSlot('4 cm mínimo', 'subestima profundidade', '5–6 cm adulto'),
    ).toBe('profundidade');
    expect(
      inferUrgenciasRcpTrapSlot('Atrasar DEA', 'esperar ciclos', 'DEA assim que disponível'),
    ).toBe('dea_atraso');
    expect(
      inferUrgenciasRcpTrapSlot('Hiperventilação', 'muitas ventilações', '30:2 sem excesso'),
    ).toBe('hiperventilacao');
  });

  it('expõe labels legíveis para slots', () => {
    expect(urgenciasSurvivalLinkLabel('compressao')).toBe('Compressões');
    expect(urgenciasRcpTrapSlotLabel('frequencia')).toBe('Frequência');
  });
});
