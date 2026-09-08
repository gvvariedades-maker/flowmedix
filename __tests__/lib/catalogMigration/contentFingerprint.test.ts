import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  fingerprintConteudoJson,
  normalizePayloadForContentFingerprint,
} from '@/lib/catalogMigration/contentFingerprint';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('contentFingerprint (RC-004)', () => {
  it('mantém fingerprint estável ao carimbar efficacy_contract', () => {
    const before = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO);
    const after = fingerprintConteudoJson(stamped);
    expect(after).toBe(before);
  });

  it('altera fingerprint quando instruction muda', () => {
    const before = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const mutated = {
      ...GOLDEN_IMUNIZACAO,
      question_data: {
        ...GOLDEN_IMUNIZACAO.question_data,
        instruction: `${GOLDEN_IMUNIZACAO.question_data.instruction} [mut]`,
      },
    };
    expect(fingerprintConteudoJson(mutated)).not.toBe(before);
  });

  it('remove efficacy_contract e anchor_100_approval da normalização', () => {
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO);
    const normalized = normalizePayloadForContentFingerprint(stamped) as {
      meta?: Record<string, unknown>;
    };
    expect(normalized.meta?.efficacy_contract).toBeUndefined();
    expect(normalized.meta?.anchor_100_approval).toBeUndefined();
  });
});
