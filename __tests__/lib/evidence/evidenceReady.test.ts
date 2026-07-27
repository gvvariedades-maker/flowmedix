import {
  evaluateEvidenceReady,
  shouldInvalidateEvidenceReady,
  type EvidenceReadyInput,
} from '@/lib/evidence/evidenceReady';

function makeReadyInput(overrides: Partial<EvidenceReadyInput> = {}): EvidenceReadyInput {
  return {
    primary_skill_id: 'portugues.pontuacao.vocativo',
    difficulty: 2,
    surface_template_id: 'pt_pontuacao_certo_errado_a01',
    question_version: 'abc123',
    human_review: true,
    content_standard_golden_v1: true,
    distractor_diagnoses_reviewed: true,
    has_inedita_transfer_candidate: true,
    misconception_codes: ['vocativo_confunde_pausa_oral_com_funcao_sintatica'],
    ...overrides,
  };
}

describe('evaluateEvidenceReady (ADR §10)', () => {
  it('retorna evidence_ready=true quando todos os requisitos são satisfeitos', () => {
    const result = evaluateEvidenceReady(makeReadyInput());
    expect(result.evidence_ready).toBe(true);
    expect(result.missing_reasons).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('bloqueia sem primary_skill_id', () => {
    const result = evaluateEvidenceReady(makeReadyInput({ primary_skill_id: null }));
    expect(result.evidence_ready).toBe(false);
    expect(result.missing_reasons).toContain('missing_primary_skill_id');
  });

  it('bloqueia sem revisão humana mesmo com todo o resto completo', () => {
    const result = evaluateEvidenceReady(makeReadyInput({ human_review: false }));
    expect(result.evidence_ready).toBe(false);
    expect(result.missing_reasons).toContain('missing_human_review');
  });

  it('bloqueia sem candidata inédita de transferência no inventário', () => {
    const result = evaluateEvidenceReady(
      makeReadyInput({ has_inedita_transfer_candidate: false }),
    );
    expect(result.evidence_ready).toBe(false);
    expect(result.missing_reasons).toContain('missing_transfer_candidate');
  });

  it('bloqueia sem diagnóstico de distratores revisado', () => {
    const result = evaluateEvidenceReady(
      makeReadyInput({ distractor_diagnoses_reviewed: false }),
    );
    expect(result.evidence_ready).toBe(false);
    expect(result.missing_reasons).toContain('missing_distractor_diagnoses_review');
  });

  it('bloqueia sem conteúdo golden-v1', () => {
    const result = evaluateEvidenceReady(
      makeReadyInput({ content_standard_golden_v1: false }),
    );
    expect(result.evidence_ready).toBe(false);
    expect(result.missing_reasons).toContain('missing_golden_v1_content_standard');
  });

  it('bloqueia sem difficulty, surface_template_id ou question_version', () => {
    expect(
      evaluateEvidenceReady(makeReadyInput({ difficulty: null })).missing_reasons,
    ).toContain('missing_difficulty');
    expect(
      evaluateEvidenceReady(makeReadyInput({ surface_template_id: null })).missing_reasons,
    ).toContain('missing_surface_template_id');
    expect(
      evaluateEvidenceReady(makeReadyInput({ question_version: null })).missing_reasons,
    ).toContain('missing_question_version');
  });

  it('acumula múltiplos motivos de bloqueio simultaneamente', () => {
    const result = evaluateEvidenceReady(
      makeReadyInput({ human_review: false, primary_skill_id: null }),
    );
    expect(result.missing_reasons).toEqual(
      expect.arrayContaining(['missing_human_review', 'missing_primary_skill_id']),
    );
  });

  it('emite warning quando não há misconception mapeada, sem bloquear por si só', () => {
    const result = evaluateEvidenceReady(makeReadyInput({ misconception_codes: [] }));
    expect(result.evidence_ready).toBe(true);
    expect(result.warnings).toContain('no_misconceptions_mapped');
  });

  it('é puro: mesmo input produz mesmo resultado', () => {
    const input = makeReadyInput({ human_review: false });
    expect(evaluateEvidenceReady(input)).toEqual(evaluateEvidenceReady(input));
  });
});

describe('shouldInvalidateEvidenceReady (ADR §11)', () => {
  const base = {
    primary_skill_id: 'portugues.pontuacao.vocativo',
    misconception_codes: ['a', 'b'],
    difficulty: 2,
    surface_template_id: 'tpl_a01',
    question_version: 'v1',
  };

  it('não invalida quando nada muda', () => {
    expect(shouldInvalidateEvidenceReady(base, { ...base })).toBe(false);
  });

  it('não invalida quando misconceptions mudam só de ordem', () => {
    expect(
      shouldInvalidateEvidenceReady(base, { ...base, misconception_codes: ['b', 'a'] }),
    ).toBe(false);
  });

  it('invalida quando primary_skill_id muda', () => {
    expect(
      shouldInvalidateEvidenceReady(base, { ...base, primary_skill_id: 'outro.skill.id' }),
    ).toBe(true);
  });

  it('invalida quando difficulty muda', () => {
    expect(shouldInvalidateEvidenceReady(base, { ...base, difficulty: 3 })).toBe(true);
  });

  it('invalida quando surface_template_id muda', () => {
    expect(
      shouldInvalidateEvidenceReady(base, { ...base, surface_template_id: 'tpl_a02' }),
    ).toBe(true);
  });

  it('invalida quando question_version muda', () => {
    expect(shouldInvalidateEvidenceReady(base, { ...base, question_version: 'v2' })).toBe(true);
  });

  it('invalida quando o conjunto de misconceptions muda de fato', () => {
    expect(
      shouldInvalidateEvidenceReady(base, { ...base, misconception_codes: ['a'] }),
    ).toBe(true);
  });
});
