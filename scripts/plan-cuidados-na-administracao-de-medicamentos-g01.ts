#!/usr/bin/env tsx
/**
 * Seleciona slugs para cuidados-na-administracao-de-medicamentos-g01 (P0 cam_alto_risco).
 *
 *   npm run plan:cuidados-na-administracao-de-medicamentos-g01
 *   npm run catalog:export-lote -- --lote=cuidados-na-administracao-de-medicamentos-g01 --from-manifest=data/catalog-migration/cuidados-na-administracao-de-medicamentos-g01/manifest.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const P0_CLUSTER = 'Alto risco / conferência dupla';
const TARGET_BRANCH = 'cam_alto_risco';

/** Âncora insulina — já golden; não repetir no g01 salvo como referência de estilo. */
const ALWAYS_EXCLUDE = new Set([
  'fepese-enfermagem-cuidados-na-administracao-de-medicamentos-1778969248953-2',
]);

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
  pedagogical_branch_inferred?: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>(ALWAYS_EXCLUDE);
  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  const handcraftLoteRe = /^cuidados-na-administracao-de-medicamentos-(g\d{2}|.+repair)$/;

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

function loadCompletoSlugs(): Set<string> {
  const manifestPath = resolve(
    process.cwd(),
    'data/catalog-migration/cuidados-na-administracao-de-medicamentos-completo/manifest.json',
  );
  if (!existsSync(manifestPath)) return new Set();
  const m = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
  return new Set(m.slugs ?? []);
}

function main(): void {
  const lote = parseArg('lote') ?? 'cuidados-na-administracao-de-medicamentos-g01';
  const batchSize = Number(parseArg('size') ?? '8');
  const reportPath = resolve(
    process.cwd(),
    'artifacts/cuidados-na-administracao-de-medicamentos-topic-cluster-report.json',
  );
  if (!existsSync(reportPath)) {
    throw new Error(
      'Rode npm run cluster:cuidados-na-administracao-de-medicamentos antes de planejar o lote.',
    );
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);
  const completoSlugs = loadCompletoSlugs();

  const pool: string[] = [];
  for (const row of report.rows) {
    if (row.pedagogical_cluster !== P0_CLUSTER) continue;
    if (row.pedagogical_branch_proposed !== TARGET_BRANCH) continue;
    if (!completoSlugs.has(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    pool.push(row.modulo_slug);
  }

  const picked = pool.slice(0, batchSize);
  if (picked.length < batchSize) {
    throw new Error(
      `Só ${picked.length} slugs P0 alto risco disponíveis (excluídos ${exclude.size}). pool=${pool.length}`,
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
      pedagogical_branch_target: TARGET_BRANCH,
      exclude_count: exclude.size,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Cuidados na Administração de Medicamentos',
    status: 'planned',
    priority: 'P0 — cam_alto_risco (19 slugs cluster)',
    slug_count: picked.length,
    pedagogical_branch_target: TARGET_BRANCH,
    anchors: [
      'examples/questao-premium-fepese-cuidados-insulina-alto-risco.json',
      'examples/questao-premium-cotec-cuidados-heparina-alto-risco.json',
    ],
    workflow: [
      'npm run plan:cuidados-na-administracao-de-medicamentos-g01',
      'npm run catalog:export-lote -- --lote=cuidados-na-administracao-de-medicamentos-g01 --from-manifest=data/catalog-migration/cuidados-na-administracao-de-medicamentos-g01/manifest.json',
      'Handcraft golden-v1 por slug — cam-high-risk-* 4/4',
      'npm run validate:goldens -- --lote=cuidados-na-administracao-de-medicamentos-g01 --strict',
      'npm run audit:questao-readiness -- --lote=cuidados-na-administracao-de-medicamentos-g01 --strict-v2-pedagogy',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:cuidados-g01] lote=${lote} slugs=${picked.length}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:cuidados-g01] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
