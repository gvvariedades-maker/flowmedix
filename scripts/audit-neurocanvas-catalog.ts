#!/usr/bin/env tsx
/**
 * Estatísticas de slides no catálogo local (NeuroCanvas audit).
 *
 *   npm run audit:neurocanvas-catalog
 *   npm run audit:neurocanvas-catalog -- --include-examples
 *   npm run audit:neurocanvas-catalog -- --limit=500
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, parseLimitArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildCatalogAuditReport,
  renderCatalogAuditMarkdown,
} from '@/lib/neurocanvas/catalogAudit';

async function main() {
  const limitRaw = parseArg('limit');
  const report = buildCatalogAuditReport({
    includeExamples: hasFlag('include-examples'),
    limit: limitRaw ? parseLimitArg(999_999) : undefined,
  });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const outJson = resolve(artifactsDir, 'neurocanvas-catalog-audit.json');
  const outMd = resolve(artifactsDir, 'neurocanvas-catalog-audit.md');

  writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(outMd, renderCatalogAuditMarkdown(report), 'utf8');

  console.log('[audit:neurocanvas-catalog] slugs únicos:', report.questions.unique_slugs);
  console.log('[audit:neurocanvas-catalog] slides:', report.slides.total);
  console.log('[audit:neurocanvas-catalog] json=', outJson);
  console.log('[audit:neurocanvas-catalog] md=', outMd);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
