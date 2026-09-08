import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  clearCommercialRuntimeApprovalCache,
  evaluateCommercialRuntimeApproval,
  fingerprintConteudoJson,
  getCommercialRuntimeDenialCacheSize,
} from '@/lib/catalogMigration/commercialRuntimeGate';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('commercialRuntimeGate cache e revogação', () => {
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

  it('não cacheia aprovação positiva (revalida a cada chamada)', () => {
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const slug = 'cpcon-imunizacao-intervalos-vf';

    const first = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(first.approved).toBe(true);
    expect(getCommercialRuntimeDenialCacheSize()).toBe(0);

    const second = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(second.approved).toBe(true);
    expect(getCommercialRuntimeDenialCacheSize()).toBe(0);
  });

  it('cacheia negação e libera após clear (revogação simulada)', () => {
    const slug = 'imunizacao-unbound-cache-test';
    const unbound = {
      ...GOLDEN_IMUNIZACAO,
      meta: { ...GOLDEN_IMUNIZACAO.meta },
    };
    delete (unbound.meta as { efficacy_contract?: unknown }).efficacy_contract;

    const first = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: unbound,
    });
    expect(first.approved).toBe(false);
    expect(first.reason).toBe('COMMERCIAL_APPROVAL_NOT_BOUND');
    expect(getCommercialRuntimeDenialCacheSize()).toBeGreaterThan(0);

    const fp = fingerprintConteudoJson(unbound);
    const stamped = stampEfficacyContentFingerprint(unbound, fp);
    clearCommercialRuntimeApprovalCache();

    const afterRevoke = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(afterRevoke.approved).toBe(true);
  });

  it('rejeita conteúdo alterado após aprovação (fingerprint novo)', () => {
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const approved = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(approved.approved).toBe(true);

    const mutated = {
      ...stamped,
      question_data: {
        ...stamped.question_data,
        instruction: `${stamped.question_data.instruction} [mut]`,
      },
    };
    const denied = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: mutated,
    });
    expect(denied.approved).toBe(false);
    expect(denied.reason).toBe('COMMERCIAL_APPROVAL_MISMATCH');
  });
});
