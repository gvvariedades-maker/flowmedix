import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';
import {
  clearCommercialRuntimeApprovalCache,
  evaluateCommercialRuntimeApproval,
  fingerprintConteudoJson,
  isCommercialRuntimeReadinessGateEnabled,
} from '@/lib/catalogMigration/commercialRuntimeGate';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('commercialRuntimeGate (RC-004)', () => {
  const prevGate = process.env.COMMERCIAL_RUNTIME_READINESS_GATE;

  beforeEach(() => {
    clearCommercialRuntimeApprovalCache();
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
  });

  afterEach(() => {
    clearCommercialRuntimeApprovalCache();
    if (prevGate === undefined) delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    else process.env.COMMERCIAL_RUNTIME_READINESS_GATE = prevGate;
  });

  describe('isCommercialRuntimeReadinessGateEnabled — opt-in explícito', () => {
    const casesOff = [undefined, 'false', '0', 'off', '', 'TRUE-ish'];
    for (const value of casesOff) {
      it(`OFF quando COMMERCIAL_RUNTIME_READINESS_GATE=${value ?? 'undefined'}`, () => {
        if (value === undefined) delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
        else process.env.COMMERCIAL_RUNTIME_READINESS_GATE = value;
        expect(isCommercialRuntimeReadinessGateEnabled()).toBe(false);
      });
    }

    for (const value of ['true', '1', 'on', 'ON', ' True ']) {
      it(`ON quando COMMERCIAL_RUNTIME_READINESS_GATE=${value}`, () => {
        process.env.COMMERCIAL_RUNTIME_READINESS_GATE = value;
        expect(isCommercialRuntimeReadinessGateEnabled()).toBe(true);
      });
    }
  });

  it('desliga gate quando env COMMERCIAL_RUNTIME_READINESS_GATE=false', () => {
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'false';
    expect(isCommercialRuntimeReadinessGateEnabled()).toBe(false);
    const result = evaluateCommercialRuntimeApproval({
      slug: 'legacy-slug',
      conteudoJson: { question_data: { instruction: 'x', options: [] } },
    });
    expect(result.approved).toBe(true);
  });

  it('desliga gate quando env ausente (merge sem rollout)', () => {
    delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    expect(isCommercialRuntimeReadinessGateEnabled()).toBe(false);
    const result = evaluateCommercialRuntimeApproval({
      slug: 'legacy-slug',
      conteudoJson: GOLDEN_IMUNIZACAO,
    });
    expect(result.approved).toBe(true);
  });

  it('bloqueia subtópico ausente do registry', () => {
    const result = evaluateCommercialRuntimeApproval({
      slug: 'legacy-untracked',
      tituloAula: 'Subtópico Legado Não Rastreado XYZ',
      conteudoJson: {
        meta: { subtopico: 'Subtópico Legado Não Rastreado XYZ', banca: 'X', topico: 'Y' },
        question_data: {
          instruction: 'Pergunta',
          options: [{ id: 'A', text: 'A', is_correct: true }],
        },
        reverse_study_slides: [],
      },
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('SUBTOPIC_NOT_IN_REGISTRY');
  });

  it('aprova golden Imunização com ready_100 e aprovação vinculada ao fingerprint', () => {
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(result.approved).toBe(true);
    expect(result.contentFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('bloqueia golden sem approved_content_fingerprint', () => {
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: GOLDEN_IMUNIZACAO,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('COMMERCIAL_APPROVAL_NOT_BOUND');
  });

  it('rejeita conteúdo mutado com fingerprint de aprovação antigo', () => {
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const first = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(first.approved).toBe(true);

    const mutated = {
      ...stamped,
      question_data: {
        ...stamped.question_data,
        instruction: `${stamped.question_data.instruction} [mutação]`,
      },
    };
    const fp2 = fingerprintConteudoJson(mutated);
    expect(fp2).not.toBe(fp);

    const second = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: mutated,
    });
    expect(second.approved).toBe(false);
    expect(second.reason).toBe('COMMERCIAL_APPROVAL_MISMATCH');
  });

  it('bloqueia danger_zone reciclado em subtópico production_ready', () => {
    const dupCorrect =
      'Mesma justificativa copiada para todas as alternativas sem personalizar o distrator.';
    const result = evaluateCommercialRuntimeApproval({
      slug: 'imunizacao-dup-test',
      tituloAula: 'Imunização',
      conteudoJson: {
        meta: {
          banca: 'TEST',
          topico: 'Enfermagem',
          subtopico: 'Imunização',
          content_standard: 'golden-v1',
          family: 'vf',
          sources: [{ id: 'ms', tier: 'A', title: 'PNI', issuer: 'MS' }],
        },
        question_data: {
          instruction: 'Assinale V ou F.',
          options: [
            { id: 'A', text: 'V', is_correct: true },
            { id: 'B', text: 'F', is_correct: false },
          ],
        },
        reverse_study_slides: [
          { type: 'concept_map', items: [{ label: 'Tema' }, { label: 'Contexto' }] },
          { type: 'logic_flow', steps: ['Passo 1'], reveal_mode: 'tap' },
          { type: 'golden_rule', content: 'Regra' },
          {
            type: 'danger_zone',
            content: 'Pegadinhas',
            items: [
              { label: 'A', detail: 'x', correct: dupCorrect },
              { label: 'B', detail: 'y', correct: dupCorrect },
            ],
          },
        ],
      },
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('READINESS_NOT_APPROVED');
  });
});
