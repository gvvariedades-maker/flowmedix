#!/usr/bin/env tsx
/**
 * Seleciona TODOS os slugs restantes para urgencias-g48 — lote FINAL (7 → 340/340).
 *
 *   npx tsx scripts/plan-urgencias-g48.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteDir, loteManifestPath } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g48';
const TOTAL = 340;

type ClusterRow = {
  slug: string;
  pedagogical_branch_proposed: string;
  pedagogical_cluster: string;
};

function loadDoneSlugs(): Set<string> {
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const loteRe = /^urgencias-g\d{2}$/;

  for (const name of readdirSync(migrationRoot)) {
    if (!loteRe.test(name)) continue;
    const manifest = join(migrationRoot, name, 'manifest.json');
    if (!existsSync(manifest)) continue;
    const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
    for (const s of m.slugs ?? []) exclude.add(s);
  }

  return exclude;
}

function main() {
  const report = JSON.parse(
    readFileSync('artifacts/urgencias-e-emergencias-topic-cluster-report.json', 'utf8'),
  ) as { rows: ClusterRow[] };

  const done = loadDoneSlugs();
  const completoDir = resolve(process.cwd(), 'data/catalog-migration/urgencias-e-emergencias-completo/questions');
  const completoManifest = JSON.parse(
    readFileSync('data/catalog-migration/urgencias-e-emergencias-completo/manifest.json', 'utf8'),
  ) as { slugs: string[] };

  const remaining = completoManifest.slugs.filter((slug) => {
    if (done.has(slug)) return false;
    return existsSync(join(completoDir, `${slug}.json`));
  });

  const expected = TOTAL - done.size;
  console.log(`[plan:urgencias-g48] done=${done.size} remaining=${remaining.length} expected=${expected}`);

  if (remaining.length !== expected) {
    console.warn(
      `[plan:urgencias-g48] contagem divergente: remaining=${remaining.length} expected=${expected} — usando todos os remaining`,
    );
  }

  console.log('\n--- FINAL LOTE (g48) ---');
  for (const slug of remaining) {
    const row = report.rows.find((r) => r.slug === slug);
    console.log(`  ${slug}`);
    if (row) {
      console.log(`    branch: ${row.pedagogical_branch_proposed} · cluster: ${row.pedagogical_cluster}`);
    }
  }

  mkdirSync(loteDir(LOTE), { recursive: true });
  writeFileSync(
    loteManifestPath(LOTE),
    `${JSON.stringify(
      {
        lote: LOTE,
        exported_at: new Date().toISOString(),
        source: 'data/catalog-migration/urgencias-e-emergencias-completo/manifest.json',
        filters: {
          subtopico: 'Urgências e Emergências',
          batch: 'g48-final-close-340',
          remaining_count: remaining.length,
        },
        slugs: remaining,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\n[plan:urgencias-g48] manifest=${remaining.length} slugs (FINAL → ${done.size + remaining.length}/${TOTAL})`);
}

main();
