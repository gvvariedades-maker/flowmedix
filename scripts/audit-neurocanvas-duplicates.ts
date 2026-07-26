#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildDuplicateAnalysisReport,
  renderDuplicateAnalysisMarkdown,
} from '@/lib/neurocanvas/duplicateAnalysis';

async function main() {
  const report = buildDuplicateAnalysisReport();
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const outJson = resolve(artifactsDir, 'neurocanvas-duplicate-analysis.json');
  const outMd = resolve(artifactsDir, 'neurocanvas-duplicate-analysis.md');

  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(outMd, renderDuplicateAnalysisMarkdown(report), 'utf8');

  console.log('[audit:neurocanvas-duplicates] grupos:', report.summary.duplicate_groups);
  console.log('[audit:neurocanvas-duplicates] divergentes:', report.summary.divergent_groups);
  console.log('[audit:neurocanvas-duplicates] json=', outJson);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
