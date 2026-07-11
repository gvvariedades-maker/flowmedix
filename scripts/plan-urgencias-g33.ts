#!/usr/bin/env tsx
/**
 * Seleciona 8 slugs para urgencias-g33 — 4º lote cauda urgencias_generico.
 *
 *   npx tsx scripts/plan-urgencias-g33.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteDir, loteManifestPath } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g33';
const LIMIT = 8;

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
  taxonomy_drift?: boolean;
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

  const pool = report.rows.filter((r) => {
    if (r.pedagogical_branch_proposed !== 'urgencias_generico') return false;
    if (!GENERICO_CLUSTERS.has(r.pedagogical_cluster)) return false;
    if (done.has(r.slug)) return false;
    if (!existsSync(join(completoDir, `${r.slug}.json`))) return false;
    return true;
  });

  const picked = pool.slice(0, LIMIT);
  if (picked.length < LIMIT) {
    console.error(`[plan:urgencias-g33] pool insuficiente: ${picked.length}/${LIMIT}`);
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
          pedagogical_branch: 'urgencias_generico',
          batch: 'g33-generico-tail-batch-4',
        },
        slugs: picked.map((p) => p.slug),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[plan:urgencias-g33] pool=${pool.length} picked=${picked.length}`);
  for (const p of picked) {
    console.log(`  ${p.slug}`);
    console.log(`    cluster: ${p.pedagogical_cluster}`);
    console.log(`    preview: ${(p.instruction_preview ?? '').slice(0, 100)}`);
  }
}

main();
