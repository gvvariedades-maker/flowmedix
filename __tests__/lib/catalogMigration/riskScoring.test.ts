import {
  assertApprovalGate,
  buildEfficacyContractFromRisk,
  hasHumanA4Signature,
  requiresHumanApproval,
  scoreQuestaoRisk,
  shouldSampleForHumanReview,
  type RiskResult,
} from '@/lib/catalogMigration/riskScoring';
import fs from 'node:fs';
import path from 'node:path';

function baseMeta(overrides: Record<string, unknown> = {}) {
  return {
    banca: 'X',
    topico: 'Enfermagem',
    subtopico: 'História da Enfermagem',
    content_standard: 'golden-v1',
    family: 'conceito',
    content_review: {
      reviewed_at: '2026-07-11',
      guideline_snapshot: 'test',
      exam_vs_current: 'none',
    },
    sources: [
      {
        id: 's1',
        tier: 'A',
        issuer: 'MS',
        title: 'Doc',
        year: 2025,
        covers: ['tema'],
      },
    ],
    ...overrides,
  };
}

function slidesMinimal() {
  return [
    {
      type: 'concept_map',
      items: [
        { label: 'A', detail: 'contexto da questão', icon: 'Target' },
        { label: 'B', detail: 'nucleo', icon: 'Book' },
        { label: 'C', detail: 'pegadinha', icon: 'AlertTriangle' },
      ],
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      steps: ['identificar', 'julgar', 'marcar', 'Em similares: regra portátil'],
    },
    { type: 'golden_rule', content: 'REGRA', rows: [{ label: 'X', value: 'Y' }] },
    {
      type: 'danger_zone',
      content: 'z',
      items: [{ label: 'A', detail: 'd', correct: 'fato distinto' }],
    },
  ];
}

describe('scoreQuestaoRisk', () => {
  it('BCG com dose 0,1 mL → alto / human_required', () => {
    const file = path.join(
      process.cwd(),
      'data/catalog-migration/imunizacao-g03/questions/amauc-enfermagem-imunizacao-1779572227744-8.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const risk = scoreQuestaoRisk(payload, { productionReady: false });

    expect(risk.risk_tier).toBe('alto');
    expect(risk.approval_mode).toBe('human_required');
    expect(risk.risk_factors).toEqual(
      expect.arrayContaining(['numeric_claim_critical', 'family_high_stakes']),
    );
    expect(requiresHumanApproval(risk)).toBe(true);
  });

  it('conceito sem número + pacote production_ready → baixo / auto', () => {
    const payload = {
      meta: baseMeta(),
      question_data: {
        instruction: 'Sobre a história da enfermagem, assinale a correta.',
        options: [
          { id: 'A', text: 'Florence Nightingale', is_correct: true },
          { id: 'B', text: 'Outra', is_correct: false },
        ],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, { productionReady: true });
    expect(risk.risk_tier).toBe('baixo');
    expect(risk.approval_mode).toBe('auto');
    expect(risk.risk_factors).toHaveLength(0);
  });

  it('family=calc → sempre alto', () => {
    const payload = {
      meta: baseMeta({
        family: 'calc',
        subtopico: 'Cálculo de Administração de Medicamentos e Infusões',
      }),
      question_data: {
        instruction: 'Quantos ml administrar?',
        options: [{ id: 'A', text: '2 ml', is_correct: true }],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, { productionReady: true });
    expect(risk.risk_tier).toBe('alto');
    expect(risk.risk_factors).toContain('family_high_stakes');
  });

  it('número só com covers tier B → alto', () => {
    const payload = {
      meta: baseMeta({
        family: 'conceito',
        sources: [
          {
            id: 's-b',
            tier: 'B',
            issuer: 'Sociedade',
            title: 'Guia',
            year: 2024,
            covers: ['dose 10 mg'],
          },
        ],
      }),
      question_data: {
        instruction: 'Dose correta é 10 mg.',
        options: [{ id: 'A', text: '10 mg', is_correct: true }],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, { productionReady: true });
    expect(risk.risk_tier).toBe('alto');
    expect(risk.risk_factors).toContain('source_tier_b_on_number');
  });

  it('exam_vs_current divergente → alto', () => {
    const payload = {
      meta: baseMeta({
        content_review: {
          reviewed_at: '2026-07-11',
          guideline_snapshot: 'PNI 2025',
          exam_vs_current: 'divergência: prova 2018 usa X; guideline atual PNI 2025: Y',
        },
      }),
      question_data: {
        instruction: 'Assinale.',
        options: [{ id: 'A', text: 'ok', is_correct: true }],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, { productionReady: true });
    expect(risk.risk_tier).toBe('alto');
    expect(risk.risk_factors).toContain('exam_vs_current_divergence');
  });

  it('pacote imaturo sem número → medio', () => {
    const payload = {
      meta: baseMeta(),
      question_data: {
        instruction: 'Assinale a correta sobre o tema.',
        options: [{ id: 'A', text: 'ok', is_correct: true }],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, { productionReady: false });
    expect(risk.risk_tier).toBe('medio');
    expect(risk.approval_mode).toBe('auto_conditional');
    expect(risk.risk_factors).toContain('subtopic_immature');
  });

  it('auto_approval desligado força human_required mesmo em baixo', () => {
    const payload = {
      meta: baseMeta(),
      question_data: {
        instruction: 'Assinale a correta sobre o tema.',
        options: [{ id: 'A', text: 'ok', is_correct: true }],
      },
      reverse_study_slides: slidesMinimal(),
    };

    const risk = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: false,
    });
    expect(risk.risk_tier).toBe('baixo');
    expect(risk.approval_mode).toBe('human_required');
  });
});

describe('assertApprovalGate / A4', () => {
  const altoRisk: RiskResult = {
    risk_tier: 'alto',
    approval_mode: 'human_required',
    risk_factors: ['numeric_claim_critical'],
    reasons: ['dose'],
  };

  it('bloqueia alto risco sem assinatura humana', () => {
    const blockers = assertApprovalGate({ meta: {} }, altoRisk);
    expect(blockers.length).toBeGreaterThan(0);
  });

  it('aceita a4_reviewer humano', () => {
    const payload = {
      meta: {
        efficacy_contract: {
          a4_reviewed: true,
          a4_reviewer: 'PC',
        },
      },
    };
    expect(hasHumanA4Signature(payload)).toBe(true);
    expect(assertApprovalGate(payload, altoRisk)).toEqual([]);
  });

  it('rejeita a4_reviewer agent: como assinatura humana', () => {
    const payload = {
      meta: {
        efficacy_contract: {
          a4_reviewed: true,
          a4_reviewer: 'agent:golden-v2',
        },
      },
    };
    expect(hasHumanA4Signature(payload)).toBe(false);
    expect(assertApprovalGate(payload, altoRisk).length).toBeGreaterThan(0);
  });

  it('buildEfficacyContractFromRisk não auto-assina alto risco', () => {
    const c = buildEfficacyContractFromRisk(altoRisk);
    expect(c.a4_reviewed).toBe(false);
    expect(c.a4_reviewer).toBeUndefined();
  });

  it('buildEfficacyContractFromRisk auto-assina baixo risco', () => {
    const baixo: RiskResult = {
      risk_tier: 'baixo',
      approval_mode: 'auto',
      risk_factors: [],
      reasons: [],
    };
    const c = buildEfficacyContractFromRisk(baixo, { isoDate: '2026-07-11' });
    expect(c.a4_reviewed).toBe(true);
    expect(c.a4_reviewer).toBe('agent:golden-v2');
    expect(c.auto_approved_at).toBe('2026-07-11');
  });
});

describe('shouldSampleForHumanReview', () => {
  it('alto sempre amostra', () => {
    expect(shouldSampleForHumanReview('alto')).toBe(true);
  });

  it('é determinístico por slug', () => {
    const a = shouldSampleForHumanReview('baixo', undefined, 'slug-abc');
    const b = shouldSampleForHumanReview('baixo', undefined, 'slug-abc');
    expect(a).toBe(b);
  });
});
