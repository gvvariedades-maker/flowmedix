#!/usr/bin/env tsx
/**
 * Exporta tabelas public.* para JSON (backup offline / Google Drive).
 *
 * Uso:
 *   npx tsx scripts/export-supabase-backup.ts --out=backups/avant-snapshot-2026-06-10/supabase-data
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createServerSupabase } from '@/lib/supabase/server';

loadEnvConfig(process.cwd());

const PAGE_SIZE = 500;

const TABLES = [
  'modulos_estudo',
  'historico_questoes',
  'study_notebooks',
  'study_notebook_items',
  'concursos',
  'concurso_modulos',
  'concurso_matriculas',
  'concurso_purchases',
  'acessos',
  'lp_templates',
  'lp_pages',
  'email_templates',
  'invite_links',
  'invite_redemptions',
  'simulado_sessions',
  'simulado_respostas',
  'simulado_analytics_daily',
  'simulado_analytics_session_dims',
  'simulado_templates',
  'error_reports',
] as const;

function parseOutDir(): string {
  const hit = process.argv.find((a) => a.startsWith('--out='));
  if (!hit) {
    throw new Error('Informe --out=caminho/da/pasta');
  }
  return resolve(hit.slice('--out='.length));
}

async function exportTable(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  table: (typeof TABLES)[number],
  outDir: string,
) {
  const rows: unknown[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`${table}: ${error.message}`);
    const batch = data ?? [];
    if (batch.length === 0) break;
    rows.push(...batch);
    offset += PAGE_SIZE;
    process.stdout.write(`  ${table}: ${rows.length} linhas\r`);
    if (batch.length < PAGE_SIZE) break;
  }

  const path = resolve(outDir, `${table}.json`);
  writeFileSync(path, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`  ${table}: ${rows.length} linhas → ${path}`);
  return rows.length;
}

async function main() {
  const outDir = parseOutDir();
  mkdirSync(outDir, { recursive: true });

  const supabase = await createServerSupabase();
  const counts: Record<string, number> = {};

  console.log(`Exportando Supabase → ${outDir}\n`);

  for (const table of TABLES) {
    counts[table] = await exportTable(supabase, table, outDir);
  }

  const manifest = {
    exported_at: new Date().toISOString(),
    project_url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    tables: counts,
    note:
      'auth.users não incluído — use backup do Dashboard Supabase ou supabase db dump para usuários Auth.',
  };

  writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\n✓ manifest.json gravado');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
