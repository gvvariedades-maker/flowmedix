#!/usr/bin/env tsx
/**
 * Auditoria do gate premium sobre o conteúdo migrado (não só examples/).
 *
 * Uso:
 *   npm run audit:premium-catalog
 *   npm run audit:premium-catalog -- --prefix=vias-de-administracao
 *   npm run audit:premium-catalog -- --exclude-prefix=visual-preview,pilot
 *   npm run audit:premium-catalog -- --warn
 *   npm run audit:premium-catalog -- --row-limit=100
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag, parseArg, parseCsvArg } from '@/lib/catalogMigration/cliArgs';
import {
  printPremiumAuditSummary,
  scanLocalPremiumCatalog,
} from '@/lib/catalogMigration/premiumCatalogAudit';

function main() {
  const includeWarn = hasFlag('warn');
  const onlyLote = parseArg('lote');
  const prefix = parseArg('prefix');
  const excludePrefixes = parseCsvArg('exclude-prefix') ?? undefined;
  const rowLimitRaw = parseArg('row-limit');
  const rowLimit = rowLimitRaw ? Number(rowLimitRaw) : 0;

  const report = scanLocalPremiumCatalog({
    onlyLote,
    prefix,
    excludePrefixes,
    includeWarn,
    rowLimit,
  });

  printPremiumAuditSummary(report, 'audit:premium-catalog');

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'premium-catalog-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:premium-catalog] relatório=${outPath}`);

  process.exitCode = report.error_rows > 0 ? 1 : 0;
}

main();
