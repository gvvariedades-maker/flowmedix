import {
  extractMeasuredValue,
  inferSvIconName,
  inferSvKind,
  inferSvReferenceRange,
  inferSvShortLabel,
  isConclusionRow,
  isSvRowMoldCompatible,
  inferMeasuredVitalStatus,
  isSvNormativeRangeText,
  parseTranslationStep,
  resolveSvKindForRow,
  shouldShowSvReferenceRange,
  svDisplayTextsNearDuplicate,
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

  it('não classifica aproximam/aproximação como SpO2 (oxim)', () => {
    expect(inferSvKind('máxima e mínima se aproximam na divergente')).toBe('other');
    expect(inferSvShortLabel('divergente: valores se aproximam')).not.toMatch(/Saturação/i);
    expect(inferSvKind('SpO2 92% oximetria de pulso')).toBe('spo2');
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
    expect(inferSvReferenceRange('36,5°C axilar')).toBe('36–37,5°C axilar');
  });

  it('não cola faixa PA em row de técnica (manguito/posição)', () => {
    expect(shouldShowSvReferenceRange('Manguito PA', 'Comprimento ~80% da circunferência', 'pa')).toBe(
      false,
    );
    expect(shouldShowSvReferenceRange('PA 110×75 mmHg', 'Normotenso', 'pa')).toBe(true);
    expect(inferSvShortLabel('Em similares / outra banca — MCQ de técnica')).toBe('Transferência');
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

  it('parseia tradução compacta com seta (âncora interpretação)', () => {
    const parsed = parseTranslationStep('PA 110×75 mmHg → normotenso (não hipo/hipertenso).', 0);
    expect(parsed.kind).toBe('translation');
    if (parsed.kind === 'translation') {
      expect(parsed.rawValue).toMatch(/110/);
      expect(parsed.clinicalTerm.toLowerCase()).toContain('normotenso');
    }
  });

  it('não trata eliminação com seta como tradução', () => {
    const parsed = parseTranslationStep('B: febril + eupneico → eliminar.', 4);
    expect(parsed.kind).toBe('plain');
  });

  it('não trata letra MCQ com irpm como tradução (FR faixas)', () => {
    const parsed = parseTranslationStep(
      'A — 30 a 60 irpm: faixa SBP para <1 ano → candidata.',
      2,
    );
    expect(parsed.kind).toBe('plain');
  });

  it('infere NORMAL/ALTERADO pelo valor aferido', () => {
    expect(inferMeasuredVitalStatus('PA 110×75 mmHg')).toBe('normal');
    expect(inferMeasuredVitalStatus('36,5°C axilar')).toBe('normal');
    expect(inferMeasuredVitalStatus('FC 110 bpm')).toBe('altered');
    expect(inferMeasuredVitalStatus('FR 30 mpm')).toBe('altered');
    expect(inferMeasuredVitalStatus('Pulso radial — indicador + médio')).toBeNull();
  });

  it('detecta faixa normativa e duplicata visual', () => {
    expect(isSvNormativeRangeText('60 a 100 bpm')).toBe(true);
    expect(isSvNormativeRangeText('110 bpm')).toBe(false);
    expect(svDisplayTextsNearDuplicate('60 a 100 bpm', '60–100 bpm')).toBe(true);
    expect(svDisplayTextsNearDuplicate('36,0–37,4°C axilar', '36 ºC a 37,5 ºC afebril')).toBe(false);
  });

  it('fallback para step de conclusão', () => {
    const parsed = parseTranslationStep('Combinar os achados e marcar a alternativa A.', 4);
    expect(parsed.kind).toBe('plain');
    if (parsed.kind === 'plain') {
      expect(parsed.title).toBe('Conclusão');
    }
  });
});
