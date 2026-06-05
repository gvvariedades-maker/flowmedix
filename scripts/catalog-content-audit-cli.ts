#!/usr/bin/env tsx
/**
 * CLI — auditoria de slides no catálogo (mesma lógica do Laboratório).
 * Uso: npm run catalog:audit [-- --sampleSize=20 --issueLimit=50]
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServerSupabase } from '@/lib/supabase/server';
import { runCatalogContentAudit } from '@/lib/admin/catalogContentAudit';

function parseArg(name: string, fallback: number): number {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const n = Number(hit.split('=')[1]);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  const sampleSize = parseArg('sampleSize', 20);
  const issueLimit = parseArg('issueLimit', 100);
  const supabase = await createServerSupabase();
  const report = await runCatalogContentAudit(supabase, { sampleSize, issueListLimit: issueLimit });

  const out = resolve(process.cwd(), 'artifacts/catalog-content-audit.json');
  writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');

  console.log('[catalog:audit] Catálogo:', report.catalog_total);
  console.log('[catalog:audit] Pacote 4× premium OK:', report.summary.fully_premium_package);
  console.log('[catalog:audit] Sem slides:', report.summary.missing_slides);
  console.log('[catalog:audit] ≠ 4 slides:', report.summary.slide_count_not_four);
  console.log('[catalog:audit] Zod inválido:', report.summary.zod_invalid);
  console.log('[catalog:audit] Relatório:', out);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
