import {
  evaluateTransferCandidate,
  mapMissingToTransferInventoryMissingEvent,
  selectTransferCandidate,
  type TransferCandidateQuestion,
  type TransferSelectorMotherContext,
} from '@/lib/evidence/transferSelector';

const mother: TransferSelectorMotherContext = {
  mother_question_id: 'mother-001',
  primary_skill_id: 'portugues.pontuacao.vocativo',
  surface_template_id: 'tpl_mother',
  difficulty: 2,
  expected_question_version: 'v1',
  detected_misconception_codes: ['vocativo_confunde_pausa_oral_com_funcao_sintatica'],
};

function makeCandidate(overrides: Partial<TransferCandidateQuestion> = {}): TransferCandidateQuestion {
  return {
    question_id: 'candidate-001',
    question_version: 'v1',
    primary_skill_id: 'portugues.pontuacao.vocativo',
    surface_template_id: 'tpl_candidate',
    difficulty: 2,
    evidence_ready: true,
    misconception_codes: [],
    exposure_count: 0,
    ...overrides,
  };
}

describe('evaluateTransferCandidate — exclusões (ADR §11, §16)', () => {
  it('aprova candidata elegível sem motivos de exclusão', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate(),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.excluded).toBe(false);
    expect(evaluation.exclusion_reasons).toEqual([]);
  });

  it('exclui a própria questão-mãe', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ question_id: 'mother-001' }),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('is_mother_question');
  });

  it('exclui questão já vista pelo aluno', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate(),
      new Set(['candidate-001']),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('already_seen');
  });

  it('exclui questão no measurement_pool do aluno', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate(),
      new Set(),
      new Set(['candidate-001']),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('in_measurement_pool');
  });

  it('exclui mesmo surface_template_id da questão-mãe', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ surface_template_id: 'tpl_mother' }),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('same_surface_template');
  });

  it('exclui question_version incompatível', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ question_version: 'v2-legacy' }),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('incompatible_question_version');
  });

  it('exclui candidata sem evidence_ready', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ evidence_ready: false }),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('not_evidence_ready');
  });

  it('exclui skill diferente da questão-mãe', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ primary_skill_id: 'portugues.crase.regencia_obrigatoria' }),
      new Set(),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toContain('different_skill');
  });

  it('exclui quando entitlement não permite a questão', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate(),
      new Set(),
      new Set(),
      new Set(['outra-questao']),
    );
    expect(evaluation.exclusion_reasons).toContain('entitlement_not_allowed');
  });

  it('acumula múltiplos motivos simultaneamente', () => {
    const evaluation = evaluateTransferCandidate(
      mother,
      makeCandidate({ evidence_ready: false, surface_template_id: 'tpl_mother' }),
      new Set(['candidate-001']),
      new Set(),
      null,
    );
    expect(evaluation.exclusion_reasons).toEqual(
      expect.arrayContaining(['already_seen', 'same_surface_template', 'not_evidence_ready']),
    );
  });
});

describe('selectTransferCandidate — ordenação determinística', () => {
  it('retorna missing:true quando nenhuma candidata é elegível', () => {
    const result = selectTransferCandidate({
      mother,
      seen_question_ids: new Set(),
      measurement_pool_question_ids: new Set(),
      entitlement_allowed_question_ids: null,
      candidates: [makeCandidate({ evidence_ready: false })],
    });
    expect(result.missing).toBe(true);
  });

  it('prioriza candidata com misconception sobreposta à detectada na mãe', () => {
    const withMisconception = makeCandidate({
      question_id: 'candidate-misconception',
      misconception_codes: ['vocativo_confunde_pausa_oral_com_funcao_sintatica'],
    });
    const withoutMisconception = makeCandidate({
      question_id: 'candidate-plain',
      misconception_codes: [],
    });
    const result = selectTransferCandidate({
      mother,
      seen_question_ids: new Set(),
      measurement_pool_question_ids: new Set(),
      entitlement_allowed_question_ids: null,
      candidates: [withoutMisconception, withMisconception],
    });
    expect(result.missing).toBe(false);
    if (!result.missing) {
      expect(result.candidate.question_id).toBe('candidate-misconception');
    }
  });

  it('prefere menor número de exposições em caso de empate de misconception', () => {
    const moreExposed = makeCandidate({ question_id: 'candidate-more-exposed', exposure_count: 5 });
    const lessExposed = makeCandidate({ question_id: 'candidate-less-exposed', exposure_count: 0 });
    const result = selectTransferCandidate({
      mother,
      seen_question_ids: new Set(),
      measurement_pool_question_ids: new Set(),
      entitlement_allowed_question_ids: null,
      candidates: [moreExposed, lessExposed],
    });
    expect(result.missing).toBe(false);
    if (!result.missing) {
      expect(result.candidate.question_id).toBe('candidate-less-exposed');
    }
  });

  it('prefere dificuldade mais próxima da mãe em caso de empate anterior', () => {
    const farDifficulty = makeCandidate({ question_id: 'candidate-far', difficulty: 5 });
    const closeDifficulty = makeCandidate({ question_id: 'candidate-close', difficulty: 2 });
    const result = selectTransferCandidate({
      mother,
      seen_question_ids: new Set(),
      measurement_pool_question_ids: new Set(),
      entitlement_allowed_question_ids: null,
      candidates: [farDifficulty, closeDifficulty],
    });
    expect(result.missing).toBe(false);
    if (!result.missing) {
      expect(result.candidate.question_id).toBe('candidate-close');
    }
  });

  it('é determinístico: mesma entrada produz a mesma escolha', () => {
    const candidates = [
      makeCandidate({ question_id: 'candidate-a' }),
      makeCandidate({ question_id: 'candidate-b' }),
    ];
    const input = {
      mother,
      seen_question_ids: new Set<string>(),
      measurement_pool_question_ids: new Set<string>(),
      entitlement_allowed_question_ids: null,
      candidates,
    };
    const first = selectTransferCandidate(input);
    const second = selectTransferCandidate(input);
    expect(first).toEqual(second);
  });
});

describe('mapMissingToTransferInventoryMissingEvent — shape do evento canônico (ADR §8)', () => {
  it('mapeia para o shape correto, sem outcome de resposta', () => {
    const event = mapMissingToTransferInventoryMissingEvent({
      user_id: 'user-1',
      mother_question_id: 'mother-001',
      primary_skill_id: 'portugues.pontuacao.vocativo',
      session_id: 'session-1',
    });
    expect(event).toEqual({
      event_type: 'transfer_inventory_missing',
      attempt_id: null,
      context: 'immediate_transfer',
      user_id: 'user-1',
      question_id: 'mother-001',
      primary_skill_id: 'portugues.pontuacao.vocativo',
      session_id: 'session-1',
    });
    expect(event).not.toHaveProperty('correct');
    expect(event).not.toHaveProperty('conviction');
    expect(event).not.toHaveProperty('selected_alternative');
  });
});
