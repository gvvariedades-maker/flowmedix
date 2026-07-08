import {
  inferUrgenciasTraumaTrapSlot,
  inferXabcdeLetter,
  urgenciasTraumaTrapSlotLabel,
  xabcdeLetterLabel,
} from '@/lib/slides/urgenciasTraumaSlideUtils';

describe('urgenciasTraumaSlideUtils', () => {
  it('inferXabcdeLetter classifica letras do protocolo', () => {
    expect(inferXabcdeLetter('X — Hemorragia', 'torniquete em membro')).toBe('x');
    expect(inferXabcdeLetter('Via aérea', 'obstrução VA')).toBe('a');
    expect(inferXabcdeLetter('Ventilação', 'oxigênio suplementar')).toBe('b');
    expect(inferXabcdeLetter('Circulação', 'pulso e choque')).toBe('c');
    expect(inferXabcdeLetter('Neurológico', 'Glasgow e pupilas')).toBe('d');
    expect(inferXabcdeLetter('Exposição', 'hipotermia e retirar roupa')).toBe('e');
    expect(inferXabcdeLetter('Pegadinha', 'erro clássico no local')).toBe('alerta');
  });

  it('inferUrgenciasTraumaTrapSlot cobre pegadinhas distintas', () => {
    expect(
      inferUrgenciasTraumaTrapSlot(
        'Torniquete no pescoço',
        'interromper carótida',
        'compressão direta em membro',
      ),
    ).toBe('hemorragia');
    expect(
      inferUrgenciasTraumaTrapSlot(
        'Tração vigorosa',
        'alinhamento anatômico',
        'imobilizar na posição encontrada',
      ),
    ).toBe('fratura');
    expect(
      inferUrgenciasTraumaTrapSlot(
        'Pasta de dente',
        'manteiga na queimadura',
        'água corrente temperatura ambiente',
      ),
    ).toBe('queimadura');
    expect(
      inferUrgenciasTraumaTrapSlot(
        'Retirar objeto',
        'abdome penetrante',
        'não retirar corpo estranho',
      ),
    ).toBe('corpo_estranho');
    expect(
      inferUrgenciasTraumaTrapSlot(
        'Colar cervical',
        'imobilização espinal',
        'estabilizar antes do transporte',
      ),
    ).toBe('transporte');
  });

  it('expõe labels legíveis para letras e slots', () => {
    expect(xabcdeLetterLabel('x')).toBe('X — Hemorragia');
    expect(urgenciasTraumaTrapSlotLabel('queimadura')).toBe('Queimadura');
  });
});
