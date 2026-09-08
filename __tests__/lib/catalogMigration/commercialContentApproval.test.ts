import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  evaluateCommercialContentApproval,
  stampEfficacyContentFingerprint,
} from '@/lib/catalogMigration/commercialContentApproval';
import {
  assertApprovalGate,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/commercialRuntimeGate';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('commercialContentApproval', () => {
  const fingerprint = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
  const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fingerprint);
  const risk = scoreQuestaoRisk(stamped, { productionReady: true, autoApprovalEnabled: true });

  it('bloqueia sem approved_content_fingerprint (APPROVAL_UNBOUND)', () => {
    const result = evaluateCommercialContentApproval(GOLDEN_IMUNIZACAO, fingerprint, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_UNBOUND');
  });

  it('aprova com efficacy_contract vinculado ao fingerprint', () => {
    const result = evaluateCommercialContentApproval(stamped, fingerprint, risk);
    expect(result.approved).toBe(true);
    expect(assertApprovalGate(stamped, risk)).toHaveLength(0);
  });

  it('rejeita fingerprint divergente (versão anterior)', () => {
    const result = evaluateCommercialContentApproval(stamped, `${fingerprint}x`, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_CONTENT_MISMATCH');
  });

  it('rejeita anchor_100 revogado', () => {
    const revoked = {
      ...stamped,
      meta: {
        ...stamped.meta,
        anchor_100_approval: { status: 'fail', reviewed_at: '2026-09-08' },
      },
    };
    const result = evaluateCommercialContentApproval(revoked, fingerprint, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_REVOKED');
  });
});
