#!/usr/bin/env tsx
/**
 * Paridade NeuroVisualPlan v0 × resolver atual (shadow mode).
 * Read-only — não altera runtime, player nem Supabase.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildNeuroVisualPlanParityReport,
  DEFAULT_MAX_MISMATCH_SAMPLES,
} from '@/lib/neurocanvas/neuroVisualPlanParity';
import {
  evaluateCatalogPreflight,
  resolvePreflightCatalogRoot,
} from './preflight-neurocanvas-parity';

function main(): void {
  const catalogRoot = resolvePreflightCatalogRoot(parseArg('catalog-root'));
  const preflight = evaluateCatalogPreflight(catalogRoot);

  if (!preflight.ok) {
    console.error('[audit:neurovisual-plan-v0-parity] ABORT: catálogo real ausente.');
    console.error(
      `[audit:neurovisual-plan-v0-parity] Esperado: ${catalogRoot}/**/questions/*.json`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[audit:neurovisual-plan-v0-parity] preflight OK — ${preflight.questionFiles} arquivo(s) em questions/`,
  );

  const maxSamplesRaw = parseArg('max-samples');
  const maxMismatchSamples = maxSamplesRaw
    ? Number.parseInt(maxSamplesRaw, 10)
    : DEFAULT_MAX_MISMATCH_SAMPLES;

  const report = buildNeuroVisualPlanParityReport({
    catalogRoot,
    maxMismatchSamples: Number.isFinite(maxMismatchSamples)
      ? maxMismatchSamples
      : DEFAULT_MAX_MISMATCH_SAMPLES,
  });

  const mismatchTotal = report.slides_compared - report.slides_equivalent;

  console.log('[audit:neurovisual-plan-v0-parity] resultado:');
  console.log(`  questões canônicas: ${report.questions_processed}`);
  console.log(`  slides comparados:  ${report.slides_compared}`);
  console.log(`  equivalentes:     ${report.slides_equivalent}/${report.slides_compared}`);
  console.log(`  divergências:       ${mismatchTotal}`);
  console.log(`  unresolved (fora):  ${report.canonical_unresolved_slugs}`);

  if (report.mismatches.length > 0) {
    console.error('[audit:neurovisual-plan-v0-parity] amostra de divergências:');
    for (const m of report.mismatches) {
      const fields = m.presentation_mismatches.map((p) => p.field).join(', ');
      const themeNote = m.theme_mismatch ? ' + theme' : '';
      console.error(
        `  ${m.slug} [${m.slide_index}] type=${m.slide_type} fields=${fields}${themeNote}`,
      );
    }
  }

  const artifactPath = join(process.cwd(), 'artifacts/neurovisual-plan-v0-parity.json');
  mkdirSync(join(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(artifactPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:neurovisual-plan-v0-parity] artifact: artifacts/neurovisual-plan-v0-parity.json`);

  if (mismatchTotal > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
