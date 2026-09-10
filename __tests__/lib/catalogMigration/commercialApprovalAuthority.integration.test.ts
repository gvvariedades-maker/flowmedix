import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  evaluateCommercialContentApproval,
  stampEfficacyContentFingerprint,
} from '@/lib/catalogMigration/commercialContentApproval';
import {
  fingerprintConteudoJson,
  normalizePayloadForContentFingerprint,
} from '@/lib/catalogMigration/contentFingerprint';
import { evaluateCommercialRuntimeApproval } from '@/lib/catalogMigration/commercialRuntimeGate';
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

const GOLDEN = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('APPROVAL_AUTHORITY — runtime comercial', () => {
  const prevGate = process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
  const fp = fingerprintConteudoJson(GOLDEN);
  const risk = scoreQuestaoRisk(GOLDEN, { productionReady: true, autoApprovalEnabled: true });

  beforeEach(() => {
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
  });

  afterEach(() => {
    if (prevGate === undefined) {
      delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    } else {
      process.env.COMMERCIAL_RUNTIME_READINESS_GATE = prevGate;
    }
  });

  it('rejeita auto-aprovação agent: com fingerprint (import spoof)', () => {
    const spoofed = {
      ...GOLDEN,
      meta: {
        ...GOLDEN.meta,
        efficacy_contract: {
          a4_reviewed: true,
          a4_reviewer: 'agent:golden-v2',
          approved_content_fingerprint: fp,
          auto_approved_at: '2026-09-08',
        },
      },
    };
    const result = evaluateCommercialContentApproval(spoofed, fp, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_AUTHORITY_INVALID');
  });

  it('rejeita anchor_100 pass com reviewer agent:', () => {
    const spoofed = {
      ...GOLDEN,
      meta: {
        ...GOLDEN.meta,
        anchor_100_approval: {
          status: 'pass',
          reviewer: 'agent:anchor-bootstrap',
          reviewed_at: '2026-09-08',
          approved_content_fingerprint: fp,
        },
      },
    };
    const result = evaluateCommercialContentApproval(spoofed, fp, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_AUTHORITY_INVALID');
  });

  it('aprova somente com assinatura humana + fingerprint (fixture autorizado)', () => {
    const stamped = stampEfficacyContentFingerprint(GOLDEN, fp, {
      reviewer: 'handcraft-qc',
    });
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(result.approved).toBe(true);
  });

  it('ready_100 sem aprovação humana vinculada → bloqueio comercial', () => {
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: GOLDEN,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('COMMERCIAL_APPROVAL_NOT_BOUND');
  });

  it('fingerprint antigo após mutação de instruction → bloqueio', () => {
    const stamped = stampEfficacyContentFingerprint(GOLDEN, fp, { reviewer: 'PC' });
    const mutated = {
      ...stamped,
      question_data: {
        ...stamped.question_data,
        instruction: `${stamped.question_data.instruction} [alterado]`,
      },
    };
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: mutated,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('COMMERCIAL_APPROVAL_MISMATCH');
  });
});

describe('FINGERPRINT_SCOPE — campos materiais', () => {
  it('altera hash ao mudar alternativas/gabarito', () => {
    const base = fingerprintConteudoJson(GOLDEN);
    const mutated = {
      ...GOLDEN,
      question_data: {
        ...GOLDEN.question_data,
        options: GOLDEN.question_data.options.map((o: { id: string; is_correct: boolean }) =>
          o.id === 'A' ? { ...o, is_correct: false } : { ...o, is_correct: true },
        ),
      },
    };
    expect(fingerprintConteudoJson(mutated)).not.toBe(base);
  });

  it('altera hash ao mudar NeuroSlides', () => {
    const base = fingerprintConteudoJson(GOLDEN);
    const mutated = {
      ...GOLDEN,
      reverse_study_slides: GOLDEN.reverse_study_slides.map((s: { type: string; content?: string }) =>
        s.type === 'golden_rule' ? { ...s, content: 'Regra alterada' } : s,
      ),
    };
    expect(fingerprintConteudoJson(mutated)).not.toBe(base);
  });

  it('altera hash ao mudar meta.sources', () => {
    const base = fingerprintConteudoJson(GOLDEN);
    const mutated = {
      ...GOLDEN,
      meta: {
        ...GOLDEN.meta,
        sources: [...(GOLDEN.meta.sources ?? []), { id: 'x', tier: 'B', title: 'Extra', issuer: 'MS' }],
      },
    };
    expect(fingerprintConteudoJson(mutated)).not.toBe(base);
  });

  it('não inclui efficacy_contract no payload normalizado', () => {
    const stamped = stampEfficacyContentFingerprint(GOLDEN);
    const norm = normalizePayloadForContentFingerprint(stamped) as { meta?: Record<string, unknown> };
    expect(norm.meta?.efficacy_contract).toBeUndefined();
    expect(fingerprintConteudoJson(stamped)).toBe(fingerprintConteudoJson(GOLDEN));
  });
});
