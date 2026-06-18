import {
  extractMeasuredValue,
  inferSvIconName,
  inferSvKind,
  inferSvReferenceRange,
  isConclusionRow,
  isSvRowMoldCompatible,
  parseTranslationStep,
  resolveSvKindForRow,
} from '@/lib/slides/vitalsSlideUtils';
import { lintVitalsGoldenContent } from '@/lib/slides/vitalsGoldenLint';
import { lintGoldenContent } from '@/lib/goldenContentStandard';

describe('vitalsSlideUtils', () => {
  it('infere ícone por tipo de sinal vital', () => {
    expect(inferSvIconName('FC 110 bpm')).toBe('HeartPulse');
    expect(inferSvIconName('PA 110×75 mmHg')).toBe('Scale');
    expect(inferSvIconName('36,5°C axilar')).toBe('Thermometer');
    expect(inferSvIconName('FR 30 mpm')).toBe('Wind');
  });

  it('não confunde Tempo com temperatura nem palpação com PA', () => {
    expect(inferSvKind('Tempo ideal 60 segundos')).toBe('other');
    expect(inferSvKind('Palpação do pulso radial')).toBe('fc');
    expect(isSvRowMoldCompatible({ label: 'Tempo ideal', value: '60 segundos' })).toBe(false);
    expect(
      isSvRowMoldCompatible({
        label: 'Técnica',
        value: 'Pulso radial, 60 segundos',
        sv_kind: 'meta',
      }),
    ).toBe(true);
  });

  it('resolve sv_kind explícito em row', () => {
    expect(resolveSvKindForRow({ label: 'X', value: 'Y', sv_kind: 'meta' })).toBe('meta');
    expect(resolveSvKindForRow({ label: 'FC 90 bpm', value: 'Normal', sv_kind: 'fc' })).toBe('fc');
  });

  it('extrai valor aferido do label', () => {
    expect(extractMeasuredValue('FC 110 bpm')).toBe('110 bpm');
    expect(extractMeasuredValue('PA 110×75 mmHg')).toBe('110×75 mmHg');
    expect(extractMeasuredValue('Temperatura axilar 36,5°C')).toBe('36,5°C');
    expect(extractMeasuredValue('Técnica', 'Pulso radial, 60 s')).toBe('Pulso radial, 60 s');
  });

  it('retorna faixa de referência por SV', () => {
    expect(inferSvReferenceRange('FC 110 bpm')).toBe('60–100 bpm');
    expect(inferSvReferenceRange('FR 30 mpm')).toBe('12–20 irpm');
  });

  it('detecta linha de conclusão na golden_rule', () => {
    expect(isConclusionRow('Conclusão', 'Alternativa A')).toBe(true);
    expect(isConclusionRow('FC 110 bpm', 'Taquicárdico')).toBe(false);
  });

  it('parseia step de tradução clínica', () => {
    const parsed = parseTranslationStep(
      'Interpretar a frequência cardíaca: 110 bpm = taquicárdico.',
      2,
    );
    expect(parsed.kind).toBe('translation');
    if (parsed.kind === 'translation') {
      expect(parsed.rawValue).toBe('110 bpm');
      expect(parsed.clinicalTerm).toBe('taquicárdico');
      expect(parsed.iconName).toBe('HeartPulse');
    }
  });

  it('fallback para step de conclusão', () => {
    const parsed = parseTranslationStep('Combinar os achados e marcar a alternativa A.', 4);
    expect(parsed.kind).toBe('plain');
    if (parsed.kind === 'plain') {
      expect(parsed.title).toBe('Conclusão');
    }
  });
});
