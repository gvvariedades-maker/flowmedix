import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { computeCandidateSha256 } from '@/lib/catalogMigration/evidenceGovernedApproval';
import {
  buildApplyGateCandidate,
  proveCandidateNormalizationFromFile,
} from '@/lib/catalogMigration/p0CandidateNormalizationProof';

const slug = 'instituto-consulplan-enfermagem-nocoes-de-anatomia-1775448440742-3';
const rawPath = join(process.cwd(), '__tests__/fixtures/p0-evidence/P0-02_editorial_raw.json');

describe('p0CandidateNormalizationProof — P0-02', () => {
  it('SEMANTIC_CHANGE=0 e hash alinhado ao apply gate', () => {
    const proof = proveCandidateNormalizationFromFile({ slug, rawFilePath: rawPath });
    expect(proof.semantic_change_count).toBe(0);
    expect(proof.equivalent_for_evidence_rebind).toBe(true);
    expect(proof.candidate_sha256).toBe(
      '2562df3861de9e6ef1ec9a8430ec19dd1d117376422ea33632b0e32891f5ef86',
    );
    expect(proof.candidate_file_sha256).toBe(
      '4e439dad93a4f8f0214c0632b93563cc2dbb81844ea386376eb2c1bc81faf960',
    );

    const gate = buildApplyGateCandidate(slug, JSON.parse(readFileSync(rawPath, 'utf8')));
    expect(gate.ok).toBe(true);
    if (!gate.ok) return;
    expect(computeCandidateSha256(gate.data)).toBe(proof.candidate_sha256);
  });
});
