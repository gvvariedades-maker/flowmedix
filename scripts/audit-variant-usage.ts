#!/usr/bin/env tsx
/**
 * Contagem de slides por layoutVariant + distribuição de forma dos genéricos.
 *
 *   npm run audit:variant-usage
 *   npm run audit:variant-usage -- --limit=500
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import {
  buildVariantUsageReport,
  resolveVariantUsageCliOptions,
} from '@/lib/neurocanvas/variantUsageAudit';

async function main() {
  const options = resolveVariantUsageCliOptions();
  const report = buildVariantUsageReport(options);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outJson = resolve(artifactsDir, 'variant-usage.json');
  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');

  console.log('[audit:variant-usage] questões:', report.questions_processed);
  console.log('[audit:variant-usage] slides:', report.slides_resolved);
  console.log('[audit:variant-usage] variantes usadas:', Object.keys(report.by_layout_variant).length);
  console.log('[audit:variant-usage] unused_declared:', report.unused_declared.length);
  console.log('[audit:variant-usage] zero_usage (bespoke):', report.zero_usage_candidates.length);
  console.log('[audit:variant-usage] low_usage (<5):', report.low_usage.length);
  if (report.top_layout_variants[0]) {
    const t = report.top_layout_variants[0];
    console.log(`[audit:variant-usage] top: ${t.variant} (${t.count}, ${t.pct}%)`);
  }
  console.log('[audit:variant-usage] json=', outJson);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
