#!/usr/bin/env tsx
/**
 * Gera manifests saude-da-crianca-g01…g08 a partir do cluster report.
 *
 *   npx tsx scripts/plan-saude-da-crianca-batches.ts
 *   npm run catalog:export-lote -- --lote=saude-da-crianca-g01 --from-manifest=data/catalog-migration/saude-da-crianca-g01/manifest.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath } from '@/lib/catalogMigration/paths';

const BATCH_SIZE = Number(parseArg('size') ?? '8');
const PREFIX = 'saude-da-crianca';

function main(): void {
  const reportPath = resolve(process.cwd(), 'artifacts/saude-da-crianca-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:saude-da-crianca antes.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
    rows: { slug: string; pedagogical_branch_proposed: string }[];
  };

  const slugs = report.rows.map((r) => r.slug);
  const batches: string[][] = [];
  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    batches.push(slugs.slice(i, i + BATCH_SIZE));
  }

  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  mkdirSync(migrationRoot, { recursive: true });

  for (let i = 0; i < batches.length; i += 1) {
    const nn = String(i + 1).padStart(2, '0');
    const lote = `${PREFIX}-g${nn}`;
    const dir = resolve(migrationRoot, lote);
    mkdirSync(dir, { recursive: true });
    const manifest = {
      lote,
      planned_at: new Date().toISOString(),
      source: 'saude-da-crianca-completo',
      batch_index: i + 1,
      batch_total: batches.length,
      slugs: batches[i],
    };
    writeFileSync(loteManifestPath(lote), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`[plan:saude-da-crianca] ${lote} slugs=${batches[i].length}`);
  }

  console.log(`[plan:saude-da-crianca] total=${slugs.length} batches=${batches.length}`);
}

main();
