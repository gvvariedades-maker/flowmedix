#!/usr/bin/env tsx
/**
 * L6 — audit da âncora do lote + checklist para revisor B (agente).
 *
 * Uso:
 *   npm run audit:anchor-review -- --lote=cme-g01
 *   npm run audit:anchor-review -- --lote=cme-g01 --record-pass --reviewer=agent
 */
import { loadEnvConfig } from '@next/env';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  defaultChecklist,
  loadAnchorPayload,
  loadLoteMeta,
  runAnchorAutomatedChecks,
  saveLoteMeta,
  writeAnchorReviewArtifact,
  type AnchorSecondReviewStatus,
} from '@/lib/catalogMigration/anchorReview';

function main(): void {
  const lote = requireArg('lote');
  const recordPass = hasFlag('record-pass');
  const recordFail = hasFlag('record-fail');
  const reviewer = parseArg('reviewer') ?? 'agent';
  const method = (parseArg('method') as 'agent' | 'human') ?? 'agent';
  const skipCapture = hasFlag('skip-capture');

  const meta = loadLoteMeta(lote);
  if (!meta?.anchor_slug) {
    throw new Error(`anchor_slug ausente em data/catalog-migration/${lote}/lote-meta.json`);
  }

  const anchorSlug = meta.anchor_slug;
  const payload = loadAnchorPayload(lote, anchorSlug);
  if (!payload) {
    throw new Error(`JSON da âncora não encontrado: ${anchorSlug}`);
  }

  const automated = runAnchorAutomatedChecks(payload, anchorSlug);

  if (!skipCapture) {
    spawnSync('npx', ['tsx', 'scripts/capture-questao-review.ts', `--slug=${anchorSlug}`], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    });
  }

  const captureDir = resolve(process.cwd(), 'artifacts/questao-review', anchorSlug);
  const capturesExist = existsSync(captureDir);

  let reviewStatus: AnchorSecondReviewStatus = automated.automated_pass ? 'pending' : 'fail';
  if (recordPass) reviewStatus = 'pass';
  if (recordFail) reviewStatus = 'fail';

  const artifactRel = writeAnchorReviewArtifact(lote, {
    generated_at: new Date().toISOString(),
    lote,
    anchor_slug: anchorSlug,
    subtopico: meta.subtopico,
    automated,
    captures_dir: capturesExist ? `artifacts/questao-review/${anchorSlug}` : null,
    checklist: defaultChecklist(),
    reviewer_b_prompt: 'docs/ANCHOR_SECOND_REVIEW_PROMPT.md',
    status: reviewStatus,
    agent_instructions:
      'Preencha checklist[].pass e notas; retorne pass|fail. Obrigatório humano se fail ou subtópico flagship.',
  });

  const updatedMeta = {
    ...meta,
    anchor_second_review: {
      reviewed_at: recordPass || recordFail ? new Date().toISOString().slice(0, 10) : null,
      reviewer: recordPass || recordFail ? reviewer : null,
      method: recordPass || recordFail ? method : null,
      status: reviewStatus,
      artifact: artifactRel,
    },
  };
  saveLoteMeta(lote, updatedMeta);

  console.log(`[audit:anchor-review] lote=${lote} anchor=${anchorSlug}`);
  console.log(
    `[audit:anchor-review] automated=${automated.automated_pass ? 'PASS' : 'FAIL'} status=${reviewStatus}`,
  );
  if (automated.issues.length > 0) {
    for (const issue of automated.issues.slice(0, 10)) {
      console.log(`  · ${issue}`);
    }
  }
  console.log(`[audit:anchor-review] artifact=${artifactRel}`);
  console.log(`[audit:anchor-review] Revisor B: anexar artifact + captures + ${artifactRel}`);

  process.exitCode = reviewStatus === 'fail' ? 1 : 0;
}

main();
