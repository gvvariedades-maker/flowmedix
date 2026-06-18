import idecanCe from '@/examples/questao-premium-idecan-fc-radial-ce.json';
import fepeseSv from '@/examples/questao-premium-fepese-sv-interpretacao-valores.json';
import { lintGoldenContent } from '@/lib/goldenContentStandard';
import { lintVitalsGoldenContent } from '@/lib/slides/vitalsGoldenLint';
import {
  inferSvKind,
  isSvRowMoldCompatible,
  resolveSvKindForRow,
} from '@/lib/slides/vitalsSlideUtils';

describe('vitalsGoldenLint', () => {
  it('golden IDECAN C/E passa lint SV', () => {
    expect(lintVitalsGoldenContent(idecanCe)).toEqual([]);
    expect(lintGoldenContent(idecanCe)).toEqual([]);
  });

  it('golden FEPESE interpretação passa lint SV', () => {
    expect(lintVitalsGoldenContent(fepeseSv)).toEqual([]);
  });

  it('rejeita golden C/E sem linha de gabarito', () => {
    const broken = {
      ...idecanCe,
      reverse_study_slides: idecanCe.reverse_study_slides.map((slide) =>
        slide.type === 'golden_rule'
          ? {
              ...slide,
              rows: (slide.rows ?? []).filter((r) => !/gabarito/i.test(r.label)),
            }
          : slide,
      ),
    };
    const codes = lintVitalsGoldenContent(broken).map((i) => i.code);
    expect(codes).toContain('sv_golden_gabarito');
  });

  it('rejeita rows legadas Como aferir / Tempo ideal sem sv_kind', () => {
    const legacyRows = [
      { label: 'Como aferir', value: 'Palpação do pulso radial' },
      { label: 'Tempo ideal', value: '60 segundos' },
      { label: 'Normalidade', value: '60 a 100 batimentos por minuto' },
      { label: 'Gabarito', value: 'Certo — letra A' },
    ];
    for (const row of legacyRows.slice(0, 2)) {
      expect(isSvRowMoldCompatible(row)).toBe(false);
    }
    const broken = {
      ...idecanCe,
      reverse_study_slides: idecanCe.reverse_study_slides.map((slide) =>
        slide.type === 'golden_rule' ? { ...slide, rows: legacyRows } : slide,
      ),
    };
    const codes = lintVitalsGoldenContent(broken).map((i) => i.code);
    expect(codes).toContain('sv_row_mold_compat');
  });

  it('rejeita taquicardia/bradicardia em golden C/E', () => {
    const broken = {
      ...idecanCe,
      reverse_study_slides: idecanCe.reverse_study_slides.map((slide) =>
        slide.type === 'golden_rule'
          ? {
              ...slide,
              rows: [
                ...(slide.rows ?? []),
                { label: 'Acima de 100 bpm', value: 'Taquicardia' },
              ],
            }
          : slide,
      ),
    };
    const codes = lintVitalsGoldenContent(broken).map((i) => i.code);
    expect(codes).toContain('sv_ce_no_extrema_rows');
  });
});

describe('inferSvKind regressions', () => {
  it('não confunde Tempo com temperatura', () => {
    expect(inferSvKind('Tempo ideal 60 segundos')).not.toBe('temp');
    expect(resolveSvKindForRow({ label: 'Tempo ideal', value: '60 segundos' })).toBe('other');
  });

  it('não confunde palpação com pressão arterial', () => {
    expect(inferSvKind('Palpação do pulso radial')).not.toBe('pa');
    expect(inferSvKind('Como aferir Palpação do pulso radial')).toBe('fc');
  });

  it('mantém detecção correta de PA, temperatura e FC medidos', () => {
    expect(inferSvKind('PA 110×75 mmHg')).toBe('pa');
    expect(inferSvKind('Temperatura axilar 36,5°C')).toBe('temp');
    expect(inferSvKind('FC 110 bpm')).toBe('fc');
  });
});
