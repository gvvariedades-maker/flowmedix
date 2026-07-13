#!/usr/bin/env tsx
/**
 * Planeja puncao-venosa-e-cuidados-com-cateteres-g08 (cauda puncao_generico).
 *
 *   npm run plan:puncao-venosa-e-cuidados-com-cateteres-g08
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g08';
const BRANCH = 'puncao_generico';

/** Clusters da cauda genérica no cluster-report (playbook g07+). */
const GENERICO_CLUSTERS = [
  'Protocolo / procedimento',
  'Default — sem âncora temática',
  'Certo ou errado',
  'Manutenção de cateter',
] as const;

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
};

function loadExcludeSlugs(): Set<string> {
  const exclude = new Set<string>();
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const handcraftLoteRe = /^puncao-venosa-e-cuidados-com-cateteres-(g\d{2}|.+repair)/;

  for (const name of readdirSync(migrationRoot)) {
    if (!handcraftLoteRe.test(name)) continue;
    if (name === LOTE) continue;
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
  const requested = Number(parseArg('size') ?? '8');
  const reportPath = resolve(process.cwd(), 'artifacts/puncao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Cluster report ausente — rode npm run cluster:puncao-venosa-e-cuidados-com-cateteres');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs();

  const pool: string[] = [];
  for (const row of report.rows) {
    if (!GENERICO_CLUSTERS.includes(row.pedagogical_cluster as (typeof GENERICO_CLUSTERS)[number])) {
      continue;
    }
    if (!isPuncaoSlug(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    pool.push(row.modulo_slug);
  }

  const batchSize = Math.min(requested, pool.length);
  const picked = pool.slice(0, batchSize);
  if (picked.length === 0) {
    throw new Error(`Nenhum slug generico disponível (pool=${pool.length}, excluídos=${exclude.size})`);
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', LOTE);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(LOTE), { recursive: true });

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: [...GENERICO_CLUSTERS],
      pedagogical_branch_target: BRANCH,
      exclude_count: exclude.size,
      pool_remaining: pool.length - picked.length,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(LOTE), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote: LOTE,
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    status: 'planned',
    priority: 'P0 cauda — puncao_generico (protocolo / manutenção / default)',
    slug_count: picked.length,
    pedagogical_branch_target: BRANCH,
    anchors: ['examples/questao-premium-gama-puncao-scalp-jelco-calibre.json'],
    anchor_slug: 'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-3',
    workflow: [
      'npm run plan:puncao-venosa-e-cuidados-com-cateteres-g08',
      `npm run catalog:export-lote -- --lote=${LOTE} --from-manifest=data/catalog-migration/${LOTE}/manifest.json`,
      'npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g08',
      `npm run validate:goldens -- --lote=${LOTE} --strict`,
      `npm run audit:questao-readiness -- --lote=${LOTE} --strict-v2-pedagogy`,
      `npm run enrich:puncao-guideline-meta -- --lote=${LOTE} --write`,
      `npm run audit:slug-alignment -- --lote=${LOTE} --strict`,
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:puncao-g08] lote=${LOTE} slugs=${picked.length} pool=${pool.length} remaining=${pool.length - picked.length}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:puncao-g08] próximo: npm run catalog:export-lote -- --lote=${LOTE} --from-manifest=data/catalog-migration/${LOTE}/manifest.json`,
  );
}

main();
