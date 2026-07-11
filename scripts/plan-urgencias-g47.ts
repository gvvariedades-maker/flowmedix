#!/usr/bin/env tsx
/**
 * Seleciona slugs para urgencias-g47 — 18º lote (cauda generico final + reconcile).
 *
 *   npx tsx scripts/plan-urgencias-g47.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteDir, loteManifestPath } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g47';
const TAIL_LIMIT = 6;

const GENERICO_CLUSTERS = new Set([
  'Default — sem âncora temática',
  'Urgências — conceito geral',
  'Certo ou errado',
  'Drift taxonômico — reclassificar subtópico',
]);

type ClusterRow = {
  slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed: string;
  instruction_preview?: string;
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

  const tailPool = report.rows.filter((r) => {
    if (r.pedagogical_branch_proposed !== 'urgencias_generico') return false;
    if (!GENERICO_CLUSTERS.has(r.pedagogical_cluster)) return false;
    if (done.has(r.slug)) return false;
    if (!existsSync(join(completoDir, `${r.slug}.json`))) return false;
    return true;
  });

  const tailPicked = tailPool.slice(0, TAIL_LIMIT);

  const outsidePool = completoManifest.slugs.filter((slug) => {
    if (done.has(slug)) return false;
    if (tailPicked.includes(slug)) return false;
    if (!existsSync(join(completoDir, `${slug}.json`))) return false;
    const row = report.rows.find((r) => r.slug === slug);
    if (!row) return true;
    if (row?.pedagogical_branch_proposed === 'urgencias_generico' && GENERICO_CLUSTERS.has(row.pedagogical_cluster)) {
      return false;
    }
    return true;
  });

  const needTo340 = 340 - (done.size + tailPicked.length);
  const outsidePicked = outsidePool.slice(0, Math.max(0, 8 - tailPicked.length));

  console.log(`[plan:urgencias-g47] done=${done.size} tail_pool=${tailPool.length} tail_picked=${tailPicked.length}`);
  console.log(`[plan:urgencias-g47] outside_pool=${outsidePool.length} outside_picked=${outsidePicked.length}`);
  console.log(`[plan:urgencias-g47] slugs_to_340_after_tail=${340 - done.size - tailPicked.length}`);

  console.log('\n--- TAIL (generico cauda) ---');
  for (const p of tailPicked) {
    console.log(`  ${p.slug}`);
  }

  console.log('\n--- OUTSIDE TAIL (reconcile preview) ---');
  for (const slug of outsidePicked) {
    const row = report.rows.find((r) => r.slug === slug);
    console.log(`  ${slug}`);
    if (row) console.log(`    branch: ${row.pedagogical_branch_proposed} · cluster: ${row.pedagogical_cluster}`);
  }

  console.log('\n--- REMAINING outside (g48+ candidates) ---');
  for (const slug of outsidePool.slice(outsidePicked.length, outsidePicked.length + 12)) {
    const row = report.rows.find((r) => r.slug === slug);
    console.log(`  ${slug} · ${row?.pedagogical_branch_proposed ?? '?'} · ${row?.pedagogical_cluster ?? '?'}`);
  }

  const slugs = [...tailPicked.map((p) => p.slug), ...outsidePicked];

  if (slugs.length !== 8) {
    console.error(`[plan:urgencias-g47] lote incompleto: ${slugs.length}/8 (tail=${tailPicked.length} outside=${outsidePicked.length})`);
    process.exit(1);
  }

  const loteMetaPath = join(loteDir(LOTE), 'lote-meta.json');
  if (existsSync(loteMetaPath)) {
    const meta = JSON.parse(readFileSync(loteMetaPath, 'utf8')) as { status?: string };
    if (meta.status === 'handcraft_complete') {
      console.log('[plan:urgencias-g47] lote já handcraft_complete — manifest não alterado');
      return;
    }
  }

  if (tailPool.length > 0 && tailPicked.length < TAIL_LIMIT) {
    console.error(`[plan:urgencias-g47] tail insuficiente: ${tailPicked.length}/${TAIL_LIMIT}`);
    process.exit(1);
  }
  mkdirSync(loteDir(LOTE), { recursive: true });
  writeFileSync(
    loteManifestPath(LOTE),
    `${JSON.stringify(
      {
        lote: LOTE,
        exported_at: new Date().toISOString(),
        source: 'artifacts/urgencias-e-emergencias-topic-cluster-report.json',
        filters: {
          subtopico: 'Urgências e Emergências',
          batch: 'g47-tail-6-plus-reconcile',
          tail_count: tailPicked.length,
          reconcile_count: outsidePicked.length,
        },
        slugs,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\n[plan:urgencias-g47] manifest=${slugs.length} slugs (tail ${tailPicked.length} + reconcile ${outsidePicked.length})`);
}

main();
