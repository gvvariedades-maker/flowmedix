#!/usr/bin/env tsx
/**
 * Planeja puncao-venosa-e-cuidados-com-cateteres-g01 (P0 puncao_flebite).
 *
 *   npm run plan:puncao-venosa-e-cuidados-com-cateteres-g01
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const P0_CLUSTER = 'Flebite e complicações';
const BRANCH = 'puncao_flebite';

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const handcraftLoteRe = /^puncao-venosa-e-cuidados-com-cateteres-(g\d{2}|.+repair)/;

  for (const name of readdirSync(migrationRoot)) {
    if (!handcraftLoteRe.test(name)) continue;
    if (skipLote && name === skipLote) continue;
    const manifest = resolve(migrationRoot, name, 'manifest.json');
    if (!existsSync(manifest)) continue;
    try {
      const m = JSON.parse(readFileSync(manifest, 'utf8')) as { slugs?: string[] };
      for (const s of m.slugs ?? []) exclude.add(s);
    } catch {
      // ignore
    }
  }
  return exclude;
}

function isPuncaoSlug(slug: string): boolean {
  return /-enfermagem-puncao-venosa-e-cuidados-com-cateteres-/.test(slug);
}

function main(): void {
  const lote = parseArg('lote') ?? 'puncao-venosa-e-cuidados-com-cateteres-g01';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/puncao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Cluster report ausente — rode npm run cluster:puncao-venosa-e-cuidados-com-cateteres');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);

  const pool: string[] = [];
  for (const row of report.rows) {
    if (row.pedagogical_cluster !== P0_CLUSTER) continue;
    if (!isPuncaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    pool.push(row.modulo_slug);
  }

  const picked = pool.slice(0, batchSize);
  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs P0 flebite disponíveis (pool=${pool.length}, excluídos=${exclude.size})`,
    );
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      cluster: P0_CLUSTER,
      pedagogical_branch_target: BRANCH,
      exclude_count: exclude.size,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    status: 'planned',
    priority: 'P0 — puncao_flebite (Flebite e complicações)',
    slug_count: picked.length,
    pedagogical_branch_target: BRANCH,
    anchors: ['examples/questao-premium-avancasp-puncao-infiltracao-flebite.json'],
    anchor_slug: picked[0],
    workflow: [
      'npm run plan:puncao-venosa-e-cuidados-com-cateteres-g01',
      `npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
      'npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g01',
      `npm run validate:goldens -- --lote=${lote} --strict`,
      `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
      `npm run audit:slug-alignment -- --lote=${lote} --strict`,
      `npm run catalog:patch-pedagogical-branch -- --lote=${lote} --reconcile-branch --apply`,
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:puncao-g01] lote=${lote} slugs=${picked.length} pool=${pool.length}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:puncao-g01] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
