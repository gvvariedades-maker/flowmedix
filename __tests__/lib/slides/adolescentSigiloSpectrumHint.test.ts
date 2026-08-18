import {
  inferSigiloSpectrumHint,
  inferSigiloSpectrumZone,
} from '@/lib/slides/adolescentSlideUtils';

describe('inferSigiloSpectrumZone', () => {
  it('mapeia linguagem rebuscada para quebrar', () => {
    expect(
      inferSigiloSpectrumZone(
        'Linguagem rebuscada / termos médicos Barreira — sexualidade alert',
      ),
    ).toBe('quebrar');
  });

  it('mapeia vínculo/rede com conduta correta para protegido', () => {
    expect(inferSigiloSpectrumZone('Vínculo e escuta conduta correta')).toBe(
      'protegido',
    );
    expect(inferSigiloSpectrumZone('Rede comunitária promoção intersetorial')).toBe(
      'protegido',
    );
  });
});

describe('inferSigiloSpectrumHint', () => {
  it('não reaproveita hint de sigilo em linguagem rebuscada', () => {
    const hint = inferSigiloSpectrumHint(
      'quebrar',
      'Linguagem rebuscada / termos médicos Barreira — sexualidade',
    );
    expect(hint.toLowerCase()).not.toMatch(/sigilo não é zero/);
    expect(hint.toLowerCase()).toMatch(/jargão|linguagem clara/);
  });

  it('respeita exam_hint explícito', () => {
    expect(
      inferSigiloSpectrumHint('protegido', 'Rede', 'Hint customizado da row.'),
    ).toBe('Hint customizado da row.');
  });

  it('dá hint de rede sem falar em sigilo sexual', () => {
    const hint = inferSigiloSpectrumHint(
      'protegido',
      'Rede comunitária Promoção intersetorial — conduta correta',
    );
    expect(hint.toLowerCase()).not.toMatch(/contracepção/);
    expect(hint.toLowerCase()).toMatch(/intersetor|escola|rede/);
  });
});
