import { desempenhoPctTone } from '@/components/dashboard/desempenho/formatDesempenho';

describe('desempenhoPctTone', () => {
  it('fica neutro sem amostra suficiente ou sem %', () => {
    expect(desempenhoPctTone(25, false)).toBe('neutral');
    expect(desempenhoPctTone(null, true)).toBe('neutral');
    expect(desempenhoPctTone(0, false)).toBe('neutral');
  });

  it('usa os mesmos limiares de Simulados quando a amostra basta', () => {
    expect(desempenhoPctTone(0, true)).toBe('danger');
    expect(desempenhoPctTone(25, true)).toBe('danger');
    expect(desempenhoPctTone(49, true)).toBe('danger');
    expect(desempenhoPctTone(50, true)).toBe('warning');
    expect(desempenhoPctTone(69, true)).toBe('warning');
    expect(desempenhoPctTone(70, true)).toBe('success');
    expect(desempenhoPctTone(100, true)).toBe('success');
  });
});
