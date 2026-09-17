#!/usr/bin/env tsx
/**
 * Gera candidate-normalized.json + normalization-diff.json para freeze P0.
 *
 * Uso:
 *   npm run p0:normalization-proof -- --p0=P0-02 --slug=<slug> --raw=<path> --out=artifacts/evidence-reviews/p0-02
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { computeCandidateSha256 } from '@/lib/catalogMigration/evidenceGovernedApproval';
import {
  buildApplyGateCandidate,
  proveCandidateNormalizationFromFile,
} from '@/lib/catalogMigration/p0CandidateNormalizationProof';
import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';

function main() {
  const p0Id = requireArg('p0');
  const slug = requireArg('slug');
  const rawPath = resolve(process.cwd(), requireArg('raw'));
  const outDir = resolve(process.cwd(), parseArg('out') ?? `artifacts/evidence-reviews/${p0Id.toLowerCase()}`);
  const writeSourceCopy = hasFlag('write-source-copy');

  mkdirSync(outDir, { recursive: true });

  const proof = proveCandidateNormalizationFromFile({ slug, rawFilePath: rawPath });
  const gate = buildApplyGateCandidate(slug, JSON.parse(readFileSync(rawPath, 'utf8')));
  if (!gate.ok) {
    throw new Error(gate.reason);
  }

  const normalizedPath = resolve(outDir, 'candidate-normalized.json');
  writeFileSync(normalizedPath, JSON.stringify(gate.data, null, 2) + '\n', 'utf8');

  const diffPath = resolve(outDir, 'normalization-diff.json');
  const diffArtifact = {
    schema_version: '1.0',
    policy: 'EVIDENCE_GOVERNED_APPROVAL_V2',
    p0_id: p0Id,
    slug,
    generated_at: new Date().toISOString(),
    raw_file_path: proof.raw_file_path,
    candidate_file_sha256: proof.candidate_file_sha256,
    candidate_sha256: proof.candidate_sha256,
    semantic_change_count: proof.semantic_change_count,
    non_semantic_change_count: proof.non_semantic_change_count,
    equivalent_for_evidence_rebind: proof.equivalent_for_evidence_rebind,
    candidate_sha256_matches_apply_gate: proof.candidate_sha256_matches_apply_gate,
    verified_hash_of_normalized_file: computeCandidateSha256(gate.data),
    differences: proof.differences,
  };
  writeFileSync(diffPath, JSON.stringify(diffArtifact, null, 2) + '\n', 'utf8');

  if (writeSourceCopy) {
    const sourcePath = resolve(outDir, 'candidate-source.json');
    writeFileSync(sourcePath, readFileSync(rawPath), 'utf8');
  }

  console.log(`[p0:normalization-proof] p0=${p0Id} slug=${slug}`);
  console.log(`[p0:normalization-proof] candidate_file_sha256=${proof.candidate_file_sha256}`);
  console.log(`[p0:normalization-proof] candidate_sha256=${proof.candidate_sha256}`);
  console.log(`[p0:normalization-proof] SEMANTIC_CHANGE=${proof.semantic_change_count}`);
  console.log(`[p0:normalization-proof] NON_SEMANTIC=${proof.non_semantic_change_count}`);
  console.log(
    `[p0:normalization-proof] equivalent_for_evidence_rebind=${proof.equivalent_for_evidence_rebind ? 'YES' : 'NO'}`,
  );
  console.log(`[p0:normalization-proof] wrote ${normalizedPath}`);
  console.log(`[p0:normalization-proof] wrote ${diffPath}`);

  if (!proof.equivalent_for_evidence_rebind) {
    process.exitCode = 1;
  }
}

main();
