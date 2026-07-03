/**
 * Testes — slugAlignment (L2) e numericFactcheck (L2b).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lintSlugAlignment, slugAlignmentHasErrors } from '@/lib/catalogMigration/slugAlignment';
import {
  extractNumericClaims,
  lintNumericFactcheck,
  matchClaimToGuideline,
  normalizeNumericToken,
} from '@/lib/catalogMigration/numericFactcheck';
import { lintLogicFlowRecycling } from '@/lib/goldenContentStandard';

const baseMeta = {
  content_standard: 'golden-v1' as const,
  family: 'protocolo' as const,
  subtopico: 'Processamento de Artigos e Produtos de Saúde',
  content_review: {
    reviewed_at: '2026-06-01',
    guideline_snapshot: 'cme-anvisa',
    exam_vs_current: 'none' as const,
  },
  sources: [
    {
      id: 'cme-anvisa-rdc15',
      tier: 'A' as const,
      issuer: 'Anvisa',
      title: 'RDC 15',
      year: 2012,
      covers: ['esterilização', 'SAL'],
    },
  ],
};

function makeProcessamentoPayload(gabaritoLetter: string, statedInSlides: string) {
  return {
    meta: { ...baseMeta, family: 'vf' as const },
    question_data: {
      instruction:
        'Julgue as afirmativas sobre classificação de Spaulding e esterilização de artigos.\nI - Artigos críticos exigem esterilização.\nII - SAL 10⁻⁶ é o nível de segurança.\nIII - Limpeza pode ser dispensada.\nAssinale a alternativa correta.',
      options: [
        { id: 'A', text: 'Apenas I', is_correct: gabaritoLetter === 'A' },
        { id: 'B', text: 'I e II', is_correct: gabaritoLetter === 'B' },
        { id: 'C', text: 'II e III', is_correct: gabaritoLetter === 'C' },
        { id: 'D', text: 'I, II e III', is_correct: gabaritoLetter === 'D' },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        items: [
          { label: 'Spaulding crítico', detail: 'penetra sistema vascular — esterilização' },
          { label: 'SAL 10⁻⁶', detail: 'probabilidade 1 em 1.000.000' },
          { label: 'Limpeza', detail: 'etapa obrigatória antes da esterilização' },
        ],
      },
      {
        type: 'golden_rule',
        content: 'Classificação Spaulding',
        rows: [
          { label: 'SAL', value: '10⁻⁶' },
          { label: 'Crítico', value: 'esterilização' },
          { label: 'Gabarito', value: statedInSlides },
        ],
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        steps: [
          'Identifique artigos críticos na classificação Spaulding',
          'Confirme SAL 10⁻⁶ como referência normativa',
          'Elimine afirmativa que dispensa limpeza obrigatória',
          'Combine I e II como gabarito da prova',
        ],
      },
      {
        type: 'danger_zone',
        content: 'Pegadinhas Spaulding/SAL',
        items: [
          { label: 'A', detail: 'Só I', correct: 'Gabarito letra B — I e II corretas' },
          { label: 'C', detail: 'II e III', correct: 'III errada — limpeza não se dispensa' },
        ],
      },
    ],
  };
}

describe('slugAlignment', () => {
  it('passa questão Spaulding/SAL alinhada (IDECAN -7)', () => {
    const payload = makeProcessamentoPayload('B', 'letra B');
    const issues = lintSlugAlignment(payload, { strict: true });
    expect(slugAlignmentHasErrors(issues)).toBe(false);
  });

  it('falha quando gabarito nos slides diverge de is_correct', () => {
    const payload = makeProcessamentoPayload('B', 'letra C');
    const issues = lintSlugAlignment(payload, { strict: true });
    expect(issues.some((i) => i.code === 'align_gabarito_letter')).toBe(true);
    expect(slugAlignmentHasErrors(issues)).toBe(true);
  });

  it('detecta logic_flow reciclado', () => {
    const longOption =
      'Pré-secar todos os instrumentos após a limpeza garantindo remoção completa de resíduos e umidade antes da embalagem estéril';
    const payload = makeProcessamentoPayload('B', 'letra B');
    const recycled = {
      ...payload,
      question_data: {
        ...payload.question_data,
        options: payload.question_data.options.map((o) => ({ ...o, text: longOption })),
      },
      reverse_study_slides: payload.reverse_study_slides.map((s) =>
        s.type === 'logic_flow'
          ? {
              ...s,
              steps: [
                longOption,
                longOption,
                'Passo independente sobre Spaulding crítico sem copiar alternativa',
              ],
            }
          : s,
      ),
    };
    const recycledIssues = lintLogicFlowRecycling(
      recycled.reverse_study_slides,
      recycled,
    );
    expect(recycledIssues.length).toBeGreaterThan(0);
  });
});

describe('numericFactcheck', () => {
  it('normaliza SAL 10⁻⁶', () => {
    expect(normalizeNumericToken('10⁻⁶')).toContain('1e-6');
  });

  it('encontra SAL na guideline CME/Processamento', () => {
    const entry = matchClaimToGuideline(
      'Processamento de Artigos e Produtos de Saúde',
      '10⁻⁶',
    );
    expect(entry?.id).toMatch(/sal|esterilizacao-def/i);
  });

  it('falha SAL 1:100.000 (insuficiente)', () => {
    const payload = {
      meta: baseMeta,
      reverse_study_slides: [
        {
          type: 'golden_rule',
          rows: [{ label: 'SAL errado', value: '1:100.000' }],
        },
      ],
    };
    const claims = extractNumericClaims(payload.reverse_study_slides);
    expect(claims.some((c) => c.includes('100'))).toBe(true);
    const issues = lintNumericFactcheck(payload);
    expect(issues.some((i) => i.code === 'numeric_fact_mismatch')).toBe(true);
  });

  it('exam_vs_current documentado vira warn only em mismatch', () => {
    const payload = {
      meta: {
        ...baseMeta,
        content_review: {
          ...baseMeta.content_review,
          exam_vs_current: 'prova_cobra_100000',
        },
      },
      reverse_study_slides: [
        {
          type: 'golden_rule',
          rows: [{ label: 'SAL prova', value: '1:100.000' }],
        },
      ],
    };
    const issues = lintNumericFactcheck(payload);
    const mismatch = issues.find((i) => i.code === 'numeric_fact_mismatch');
    if (mismatch) {
      expect(mismatch.severity).toBe('warn');
    }
  });

  it('âncoras Imunização cadeia frio passam factcheck (2 °C e 8 °C)', () => {
    const anchors = [
      'questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
      'questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
    ];
    for (const file of anchors) {
      const payload = JSON.parse(
        readFileSync(join(process.cwd(), 'examples', file), 'utf8'),
      );
      const claims = extractNumericClaims(payload.reverse_study_slides);
      expect(claims.length).toBeGreaterThan(0);
      for (const claim of claims) {
        expect(matchClaimToGuideline('Imunização', claim)).not.toBeNull();
      }
      const issues = lintNumericFactcheck(payload);
      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    }
  });

  it('matchClaim encontra rede de frio positiva e diluentes', () => {
    expect(matchClaimToGuideline('Imunização', '2 °C a 8 °C')?.id).toBe('cadeia-frio-2-8');
    expect(matchClaimToGuideline('Imunização', 'Acima de 8 °C')?.id).toBe('rede-frio-acima-8');
    expect(matchClaimToGuideline('Imunização', '24 horas')?.id).toBe('diluente-24h');
    expect(matchClaimToGuideline('Imunização', '−15 °C a −25 °C')?.id).toBe('rede-frio-freezer');
  });
});
