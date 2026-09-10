import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  detectUntrustedCommercialApprovalClaims,
  issueServerCommercialApproval,
  isVerifiableHumanCommercialReviewer,
  stripCommercialApprovalBinding,
} from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import {
  evaluateCommercialContentApproval,
  stampEfficacyContentFingerprint,
} from '@/lib/catalogMigration/commercialContentApproval';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';
import { validateQuestaoForWrite } from '@/lib/questaoSpec';
import { WRITE_SPEC_TEST_QUESTION } from '@/lib/questaoSpec/testFixtures';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('commercialApprovalWriteBoundary — RC-004c', () => {
  const baseFp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);

  it('rejeita reviewer human:spoof como verificável', () => {
    expect(isVerifiableHumanCommercialReviewer('human:spoof')).toBe(false);
    expect(isVerifiableHumanCommercialReviewer('PC')).toBe(true);
    expect(isVerifiableHumanCommercialReviewer('handcraft-qc')).toBe(true);
  });

  it('validateQuestaoForWrite bloqueia fingerprint importado', () => {
    const spoofed = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, baseFp, {
      reviewer: 'human:spoof',
    });
    const result = validateQuestaoForWrite(spoofed);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.layer === 'commercial_approval' && e.code.includes('fingerprint')),
      ).toBe(true);
    }
  });

  it('validateQuestaoForWrite bloqueia anchor_100 pass fabricado', () => {
    const forged = {
      ...GOLDEN_IMUNIZACAO,
      meta: {
        ...GOLDEN_IMUNIZACAO.meta,
        anchor_100_approval: {
          status: 'pass',
          reviewer: 'PC',
          approved_content_fingerprint: baseFp,
        },
      },
    };
    const result = validateQuestaoForWrite(forged);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === 'commercial_anchor_pass_untrusted')).toBe(true);
    }
  });

  it('sanitize remove fingerprint e rebaixa anchor pass em import limpo', () => {
    const spoofed = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, baseFp);
    const stripped = stripCommercialApprovalBinding(spoofed);
    expect(stripped.meta?.efficacy_contract?.approved_content_fingerprint).toBeUndefined();
  });

  it('issueServerCommercialApproval carimba fingerprint server-side com revisor humano válido', () => {
    const withHuman = {
      ...GOLDEN_IMUNIZACAO,
      meta: {
        ...GOLDEN_IMUNIZACAO.meta,
        efficacy_contract: {
          a4_reviewed: true,
          a4_reviewer: 'PC',
        },
      },
    };
    const issued = issueServerCommercialApproval({
      payload: withHuman,
      riskContext: { productionReady: true, autoApprovalEnabled: true },
    });
    expect(issued.stamped).toBe(true);
    const fp = fingerprintConteudoJson(issued.payload);
    expect(issued.payload.meta?.efficacy_contract?.approved_content_fingerprint).toBe(fp);
    const risk = scoreQuestaoRisk(issued.payload, { productionReady: true, autoApprovalEnabled: true });
    const runtime = evaluateCommercialContentApproval(issued.payload, fp, risk);
    expect(runtime.approved).toBe(true);
  });

  it('issueServerCommercialApproval não carimba com human:spoof', () => {
    const spoofed = {
      ...GOLDEN_IMUNIZACAO,
      meta: {
        ...GOLDEN_IMUNIZACAO.meta,
        efficacy_contract: {
          a4_reviewed: true,
          a4_reviewer: 'human:spoof',
        },
      },
    };
    const issued = issueServerCommercialApproval({
      payload: spoofed,
      riskContext: { productionReady: true, autoApprovalEnabled: true },
    });
    expect(issued.stamped).toBe(false);
    expect(issued.payload.meta?.efficacy_contract?.approved_content_fingerprint).toBeUndefined();
  });

  it('alteração material invalida binding anterior (mismatch)', () => {
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, baseFp, { reviewer: 'PC' });
    const risk = scoreQuestaoRisk(stamped, { productionReady: true, autoApprovalEnabled: true });
    const tampered = {
      ...stamped,
      question_data: {
        ...stamped.question_data,
        instruction: `${stamped.question_data.instruction} [alterado]`,
      },
    };
    const newFp = fingerprintConteudoJson(tampered);
    const result = evaluateCommercialContentApproval(tampered, newFp, risk);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('APPROVAL_CONTENT_MISMATCH');
  });

  it('import limpo de WRITE_SPEC_TEST_QUESTION não inclui fingerprint', () => {
    const result = validateQuestaoForWrite(WRITE_SPEC_TEST_QUESTION);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.meta?.efficacy_contract?.approved_content_fingerprint).toBeUndefined();
    }
  });
});
