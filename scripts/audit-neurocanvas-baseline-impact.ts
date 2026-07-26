#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildBaselineImpactReport,
  renderBaselineImpactMarkdown,
} from '@/lib/neurocanvas/baselineImpact';

async function main() {
  const report = buildBaselineImpactReport();
  const dir = resolve(process.cwd(), 'artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'neurocanvas-baseline-impact.md'), renderBaselineImpactMarkdown(report), 'utf8');
  writeFileSync(resolve(dir, 'neurocanvas-baseline-impact.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log('[audit:neurocanvas-baseline-impact] canonical:', report.canonical_slugs);
  console.log('[audit:neurocanvas-baseline-impact] blocked:', report.blocked_slugs);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
