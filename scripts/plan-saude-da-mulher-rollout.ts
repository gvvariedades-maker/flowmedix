#!/usr/bin/env tsx
/**
 * Gera manifests g02–gNN para os 4 ramos fortes (~200 slugs, batch 8).
 *
 *   npm run plan:saude-da-mulher-rollout
 *   npm run plan:saude-da-mulher-rollout -- --from=g03
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath } from '@/lib/catalogMigration/paths';
import {
  BRANCH_CLUSTER,
  STRONG_BRANCHES,
  loadClusterRows,
  loadExcludeSlugs,
  slugsForBranch,
} from './lib/saude-da-mulher-plan';

const BATCH_SIZE = 8;

type RolloutLote = {
  lote: string;
  branch_id: string;
  cluster: string;
  slug_count: number;
  slugs: string[];
};

function loteName(n: number): string {
  return `saude-da-mulher-g${String(n).padStart(2, '0')}`;
}

function main(): void {
  const fromG = Number(parseArg('from')?.replace(/^g?/, '') ?? '3');
  const exclude = loadExcludeSlugs();
  const rows = loadClusterRows();

  const pools: Record<string, string[]> = {};
  for (const branch of STRONG_BRANCHES) {
    pools[branch] = slugsForBranch(rows, branch, exclude);
  }

  const totalStrong = Object.values(pools).reduce((a, b) => a + b.length, 0);
  const rollout: RolloutLote[] = [];
  let gNum = fromG;

  for (const branch of STRONG_BRANCHES) {
    const pool = [...pools[branch]!];
    while (pool.length >= BATCH_SIZE) {
      const batch = pool.splice(0, BATCH_SIZE);
      const lote = loteName(gNum++);
      const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
      mkdirSync(loteDir, { recursive: true });

      const slugsFile = resolve(loteDir, `${lote.replace('saude-da-mulher-', '')}-slugs.json`);
      writeFileSync(slugsFile, JSON.stringify(batch, null, 2), 'utf8');

      const manifest = {
        lote,
        exported_at: new Date().toISOString(),
        source: 'rollout-plan',
        branch_id: branch,
        cluster: BRANCH_CLUSTER[branch],
        slugs: batch,
      };
      writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

      const loteMeta = {
        lote,
        subtopico: 'Saúde da Mulher',
        status: 'planned',
        pedagogical_branch_target: branch,
        slug_count: batch.length,
        handcraft_grammar: 'data/catalog-migration/saude-da-mulher-pedagogy-errors.json',
        guideline: 'lib/guidelines/saudeMulher.ts',
      };
      writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

      rollout.push({
        lote,
        branch_id: branch,
        cluster: BRANCH_CLUSTER[branch],
        slug_count: batch.length,
        slugs: batch,
      });
    }
  }

  const artifact = resolve('artifacts/saude-da-mulher-rollout-plan.json');
  const summary = {
    generated_at: new Date().toISOString(),
    batch_size: BATCH_SIZE,
    strong_branches: STRONG_BRANCHES,
    total_strong_slugs_available: totalStrong,
    lotes_planned: rollout.length,
    slugs_planned: rollout.reduce((a, r) => a + r.slug_count, 0),
    pct_of_catalog: Math.round((rollout.reduce((a, r) => a + r.slug_count, 0) / 263) * 1000) / 10,
    exclude_count: exclude.size,
    lotes: rollout,
  };
  writeFileSync(artifact, JSON.stringify(summary, null, 2), 'utf8');

  console.log(
    `[plan:saude-da-mulher-rollout] lotes=${rollout.length} slugs=${summary.slugs_planned} (~${summary.pct_of_catalog}% catálogo)`,
  );
  console.log(`[plan:saude-da-mulher-rollout] artifact=${artifact}`);
  for (const r of rollout) {
    console.log(`  ${r.lote} · ${r.branch_id} · ${r.slug_count} slugs`);
  }

  const registryNote = resolve('data/catalog-migration/saude-da-mulher-completo/handcraft-meta.json');
  if (existsSync(registryNote)) {
    const meta = JSON.parse(readFileSync(registryNote, 'utf8')) as Record<string, unknown>;
    meta.rollout_plan = artifact;
    meta.rollout_lotes = rollout.length;
    meta.rollout_slugs = summary.slugs_planned;
    writeFileSync(registryNote, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  }
}

main();
