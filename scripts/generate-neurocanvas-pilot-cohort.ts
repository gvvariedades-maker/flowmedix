#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildCanonicalCatalog } from '@/lib/neurocanvas/canonicalCatalog';
import { buildPilotCohortReport, renderPilotCohortMarkdown } from '@/lib/neurocanvas/pilotCohort';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';

async function main() {
  const resolverPath = resolve('artifacts/neurocanvas-resolver-audit-catalog-full.json');
  if (!existsSync(resolverPath)) {
    throw new Error('Execute npm run audit:resolve-slide-presentation -- --source=catalog antes.');
  }

  const resolver = JSON.parse(readFileSync(resolverPath, 'utf8')) as {
    rows: Parameters<typeof buildPilotCohortReport>[0]['resolverRows'];
  };

  const catalog = buildCanonicalCatalog();
  const report = buildPilotCohortReport({
    catalog,
    resolverRows: resolver.rows,
  });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const outJson = resolve(artifactsDir, 'neurocanvas-pilot-cohort.json');
  const outMd = resolve(artifactsDir, 'neurocanvas-pilot-cohort.md');

  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(outMd, renderPilotCohortMarkdown(report), 'utf8');

  console.log('[generate:neurocanvas-pilot-cohort] pilotos:', report.pilot_count);
  console.log('[generate:neurocanvas-pilot-cohort] controles:', report.control_count);
  console.log('[generate:neurocanvas-pilot-cohort] json=', outJson);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
