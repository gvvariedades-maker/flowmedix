import {
  inferTriageColor,
  inferUrgenciasManchesterTrapSlot,
  triageColorLabel,
} from '@/lib/slides/urgenciasManchesterSlideUtils';

describe('urgenciasManchesterSlideUtils', () => {
  it('inferTriageColor classifica etiquetas', () => {
    expect(inferTriageColor('Vermelho', 'emergência imediata')).toBe('vermelho');
    expect(inferTriageColor('Amarelo', 'urgente monitorar')).toBe('amarelo');
    expect(inferTriageColor('Verde', 'leve ambulante')).toBe('verde');
    expect(inferTriageColor('Azul', 'não urgente')).toBe('azul');
  });

  it('inferUrgenciasManchesterTrapSlot cobre pegadinhas', () => {
    expect(
      inferUrgenciasManchesterTrapSlot('Letra B', 'amarelo', 'dispensa monitoramento'),
    ).toBe('amarelo_monitor');
    expect(
      inferUrgenciasManchesterTrapSlot('Letra C', 'azul', 'instabilidade'),
    ).toBe('azul_instabilidade');
    expect(
      inferUrgenciasManchesterTrapSlot('Letra D', 'verde', 'transporte agilidade'),
    ).toBe('verde_transporte');
  });

  it('expõe labels legíveis', () => {
    expect(triageColorLabel('vermelho')).toBe('Vermelho');
  });
});
