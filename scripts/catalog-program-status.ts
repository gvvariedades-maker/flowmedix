#!/usr/bin/env tsx
/**
 * Matriz de progresso — programa catálogo 41 subtópicos.
 *
 *   npm run catalog:program-status
 *   npm run catalog:program-status -- --json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import {
  buildCatalogProgramReport,
  formatCatalogProgramSummary,
} from '@/lib/catalogMigration/catalogProgramStatus';

function main(): void {
  const jsonOnly = hasFlag('json');
  const report = buildCatalogProgramReport();

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'catalog-program-status.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatCatalogProgramSummary(report));
    console.log(`\n[catalog:program-status] relatório=${outPath}`);
  }
}

main();
