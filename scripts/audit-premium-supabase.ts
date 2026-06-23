#!/usr/bin/env tsx
/**
 * Auditoria premium do catálogo vivo (Supabase) — mesmo gate do apply-lote.
 *
 * Uso:
 *   npm run audit:premium-supabase
 *   npm run audit:premium-supabase -- --subtopico=Vias
 *   npm run audit:premium-supabase -- --slug-contains=vias-de-administracao
 *   npm run audit:premium-supabase -- --max-rows=500
 *   npm run audit:premium-supabase -- --warn
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  printPremiumAuditSummary,
  scanSupabasePremiumCatalog,
} from '@/lib/catalogMigration/premiumCatalogAudit';
import { createServerSupabase } from '@/lib/supabase/server';

async function main() {
  const includeWarn = hasFlag('warn');
  const subtopicoContains = parseArg('subtopico');
  const slugContains = parseArg('slug-contains');
  const maxRowsRaw = parseArg('max-rows');
  const rowLimitRaw = parseArg('row-limit');
  const maxRows = maxRowsRaw ? Number(maxRowsRaw) : 0;
  const rowLimit = rowLimitRaw ? Number(rowLimitRaw) : 500;

  const supabase = await createServerSupabase();
  const report = await scanSupabasePremiumCatalog(supabase, {
    includeWarn,
    subtopicoContains,
    slugContains,
    maxRows,
    rowLimit,
  });

  printPremiumAuditSummary(report, 'audit:premium-supabase');

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'premium-supabase-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:premium-supabase] relatório=${outPath}`);

  process.exitCode = report.error_rows > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error('[audit:premium-supabase]', err);
  process.exitCode = 1;
});
