#!/usr/bin/env tsx
/**
 * Clusters de variantes estruturalmente equivalentes.
 *
 *   npm run audit:variant-similarity
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildVariantSimilarityReport,
  renderVariantSimilarityMarkdown,
} from '@/lib/neurocanvas/variantSimilarityAudit';

async function main() {
  const report = buildVariantSimilarityReport();
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const outMd = resolve(artifactsDir, 'variant-similarity.md');
  const outJson = resolve(artifactsDir, 'variant-similarity.json');

  writeFileSync(outMd, renderVariantSimilarityMarkdown(report), 'utf8');
  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');

  console.log('[audit:variant-similarity] files:', report.files_scanned);
  console.log('[audit:variant-similarity] clusters:', report.clusters.length);
  console.log('[audit:variant-similarity] fusion candidates:', report.fusion_candidate_count);
  console.log('[audit:variant-similarity] singletons:', report.singleton_count);
  console.log('[audit:variant-similarity] md=', outMd);
  console.log('[audit:variant-similarity] json=', outJson);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
