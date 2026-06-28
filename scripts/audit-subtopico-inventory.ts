#!/usr/bin/env tsx
/**
 * Inventário de taxonomia — titulo_aula × meta.subtopico × canônicos × catch-all.
 *
 * Uso:
 *   npm run audit:subtopico-inventory
 *   npm run audit:subtopico-inventory -- --subtopico=Procedimentos
 *   npm run audit:subtopico-inventory -- --catch-all-only
 *   npm run audit:subtopico-inventory -- --mismatches-only
 *   npm run audit:subtopico-inventory -- --max-rows=1000
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildSubtopicoInventoryReport,
  printSubtopicoInventorySummary,
  type CatalogRowForInventory,
} from '@/lib/catalogMigration/subtopicoInventory';
import { createServerSupabase } from '@/lib/supabase/server';

const PAGE_SIZE = 500;

async function fetchAllRows(maxRows: number): Promise<CatalogRowForInventory[]> {
  const supabase = await createServerSupabase();
  const rows: CatalogRowForInventory[] = [];
  let offset = 0;

  while (true) {
    if (maxRows > 0 && rows.length >= maxRows) break;

    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);

    const batch = (data ?? []) as CatalogRowForInventory[];
    if (batch.length === 0) break;

    for (const row of batch) {
      rows.push(row);
      if (maxRows > 0 && rows.length >= maxRows) break;
    }

    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

async function main() {
  const subtopicoContains = parseArg('subtopico');
  const maxRowsRaw = parseArg('max-rows');
  const maxRows = maxRowsRaw ? Number(maxRowsRaw) : 0;
  const catchAllOnly = hasFlag('catch-all-only');
  const mismatchesOnly = hasFlag('mismatches-only');

  const catalogRows = await fetchAllRows(maxRows);
  const report = buildSubtopicoInventoryReport(catalogRows, {
    subtopicoContains,
    catchAllOnly,
    mismatchesOnly,
  });

  printSubtopicoInventorySummary(report);

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'subtopico-inventory-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:subtopico-inventory] relatório=${outPath}`);

  if (report.mismatches.length > 0) {
    const csvPath = resolve(artifactsDir, 'subtopico-inventory-mismatches.csv');
    const header = 'slug,titulo_aula,meta_subtopico';
    const lines = report.mismatches.map((r) =>
      [r.slug, r.titulo_aula ?? '', r.meta_subtopico ?? '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    writeFileSync(csvPath, [header, ...lines].join('\n'), 'utf8');
    console.log(`[audit:subtopico-inventory] mismatches_csv=${csvPath}`);
  }
}

main().catch((err) => {
  console.error('[audit:subtopico-inventory]', err);
  process.exitCode = 1;
});
