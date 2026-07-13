#!/usr/bin/env tsx
/**
 * Planeja puncao-venosa-e-cuidados-com-cateteres-g14 (caudas P0: exceto + dispositivo + tempo — 11 slugs).
 *
 *   npm run plan:puncao-venosa-e-cuidados-com-cateteres-g14
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g14';
const CLUSTER_PRIORITY = [
  { cluster: 'EXCETO — técnica / conduta', branch: 'puncao_exceto' },
  { cluster: 'Dispositivo / calibre / jelco', branch: 'puncao_dispositivo' },
  { cluster: 'Tempo / observação pós-procedimento', branch: 'puncao_tempo' },
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
  const requested = Number(parseArg('size') ?? '11');
  const reportPath = resolve(process.cwd(), 'artifacts/puncao-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Cluster report ausente — rode npm run cluster:puncao-venosa-e-cuidados-com-cateteres');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs();

  const picked: { slug: string; cluster: string; branch: string }[] = [];
  for (const { cluster, branch } of CLUSTER_PRIORITY) {
    for (const row of report.rows) {
      if (picked.length >= requested) break;
      if (row.pedagogical_cluster !== cluster) continue;
      if (!isPuncaoSlug(row.modulo_slug)) continue;
      if (exclude.has(row.modulo_slug)) continue;
      if (picked.some((p) => p.slug === row.modulo_slug)) continue;
      picked.push({ slug: row.modulo_slug, cluster, branch });
    }
  }

  if (picked.length === 0) {
    throw new Error('Nenhum slug disponível para g14');
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', LOTE);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(LOTE), { recursive: true });

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      clusters: CLUSTER_PRIORITY.map((c) => c.cluster),
      exclude_count: exclude.size,
      slug_meta: picked,
    },
    slugs: picked.map((p) => p.slug),
  };
  writeFileSync(loteManifestPath(LOTE), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote: LOTE,
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    status: 'planned',
    priority: 'P0 — caudas exceto + dispositivo + tempo',
    slug_count: picked.length,
    workflow: [
      'npm run plan:puncao-venosa-e-cuidados-com-cateteres-g14',
      `npm run catalog:export-lote -- --lote=${LOTE} --from-manifest=data/catalog-migration/${LOTE}/manifest.json`,
      'npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g14',
      `npm run validate:goldens -- --lote=${LOTE} --strict`,
      `npm run audit:questao-readiness -- --lote=${LOTE} --strict-v2-pedagogy`,
      `npm run enrich:puncao-guideline-meta -- --lote=${LOTE} --write`,
      `npm run audit:slug-alignment -- --lote=${LOTE} --strict`,
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:puncao-g14] lote=${LOTE} slugs=${picked.length}`);
  for (const p of picked) console.log(`  · [${p.branch}] ${p.slug}`);
  console.log(
    `[plan:puncao-g14] próximo: npm run catalog:export-lote -- --lote=${LOTE} --from-manifest=data/catalog-migration/${LOTE}/manifest.json`,
  );
}

main();
