import {
  assertBindingOnlyDiffAllowlist,
  deepValueEqual,
} from '@/lib/catalogMigration/bindingOnlyDiff';

describe('bindingOnlyDiff', () => {
  const basePayload = {
    meta: {
      subtopico: 'Epidemiologia e Vigilância Epidemiológica',
      family: 'conceito',
      sources: [{ id: 'ms', tier: 'A' }],
      efficacy_contract: { risk_tier: 'baixo', approval_mode: 'auto' },
    },
    question_data: {
      instruction: 'Pergunta?',
      options: [
        { id: 'A', text: 'a', is_correct: false },
        { id: 'B', text: 'b', is_correct: true },
      ],
    },
    reverse_study_slides: [{ type: 'concept_map', items: [{ label: 'x' }] }],
  };

  it('A — arrays idênticos por conteúdo com referências diferentes => PASS', () => {
    const pre = { ...basePayload, question_data: { ...basePayload.question_data, options: [{ id: 'A', text: 'a', is_correct: false }] } };
    const post = JSON.parse(JSON.stringify(pre));
    expect(deepValueEqual(pre.question_data.options, post.question_data.options)).toBe(true);
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(true);
  });

  it('B — option muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.question_data.options[0].text = 'alterado';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('C — is_correct muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.question_data.options[0].is_correct = true;
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('D — instruction muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.question_data.instruction = 'outra';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('E — NeuroSlide muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.reverse_study_slides[0].items[0].label = 'y';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('F — meta.sources muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.sources[0].tier = 'B';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('G — meta.subtopico muda => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.subtopico = 'Outro';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('H — apenas a4_reviewed muda => PASS', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.a4_reviewed = true;
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(true);
  });

  it('I — apenas a4_reviewer muda => PASS', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.a4_reviewer = 'GV';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(true);
  });

  it('J — approved_content_fingerprint adicionado => PASS', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.approved_content_fingerprint = 'abc';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(true);
  });

  it('K — auto_approved_at adicionado => PASS', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.auto_approved_at = '2026-09-12';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(true);
  });

  it('L — risk_tier removido => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    delete post.meta.efficacy_contract.risk_tier;
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('M — risk_factors alterado => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.risk_factors = ['x'];
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('N — approval_mode alterado inesperadamente => FAIL', () => {
    const post = JSON.parse(JSON.stringify(basePayload));
    post.meta.efficacy_contract.approval_mode = 'human_required';
    expect(assertBindingOnlyDiffAllowlist(basePayload, post).ok).toBe(false);
  });

  it('O — risk_factors idêntico deep-cloned => PASS', () => {
    const pre = JSON.parse(JSON.stringify(basePayload));
    pre.meta.efficacy_contract.risk_factors = ['dose', 'protocolo'];
    const post = JSON.parse(JSON.stringify(pre));
    post.meta.efficacy_contract.a4_reviewer = 'GV';
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(true);
  });

  it('P — anchor_100 reviewer muda => FAIL', () => {
    const pre = JSON.parse(JSON.stringify(basePayload));
    pre.meta.anchor_100_approval = {
      status: 'pass',
      reviewer: 'PC',
      reviewed_at: '2026-09-08',
      approved_content_fingerprint: 'abc',
    };
    const post = JSON.parse(JSON.stringify(pre));
    post.meta.anchor_100_approval.reviewer = 'GV';
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(false);
  });

  it('Q — anchor_100 status muda => FAIL', () => {
    const pre = JSON.parse(JSON.stringify(basePayload));
    pre.meta.anchor_100_approval = { status: 'pass', reviewer: 'PC' };
    const post = JSON.parse(JSON.stringify(pre));
    post.meta.anchor_100_approval.status = 'pending';
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(false);
  });

  it('R — anchor_100 fingerprint muda => FAIL', () => {
    const pre = JSON.parse(JSON.stringify(basePayload));
    pre.meta.anchor_100_approval = {
      status: 'pass',
      reviewer: 'PC',
      approved_content_fingerprint: 'aaa',
    };
    const post = JSON.parse(JSON.stringify(pre));
    post.meta.anchor_100_approval.approved_content_fingerprint = 'bbb';
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(false);
  });

  it('S — anchor_100 idêntico deep-cloned => PASS', () => {
    const pre = JSON.parse(JSON.stringify(basePayload));
    pre.meta.anchor_100_approval = {
      status: 'pass',
      reviewer: 'PC',
      reviewed_at: '2026-09-08',
    };
    const post = JSON.parse(JSON.stringify(pre));
    post.meta.efficacy_contract.a4_reviewer = 'GV';
    expect(assertBindingOnlyDiffAllowlist(pre, post).ok).toBe(true);
  });
});
