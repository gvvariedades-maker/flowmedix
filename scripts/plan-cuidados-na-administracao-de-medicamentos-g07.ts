#!/usr/bin/env tsx
/**
 * Seleciona slugs para cuidados-na-administracao-de-medicamentos-g07 (cam_generico — Default).
 *
 *   npm run plan:cuidados-na-administracao-de-medicamentos-g07
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const P0_CLUSTER = 'Default — sem âncora temática';
const TARGET_BRANCH = 'cam_generico';

type ClusterRow = {
  modulo_slug: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed?: string;
};

function loadExcludeSlugs(skipLote?: string): Set<string> {
  const exclude = new Set<string>();
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
  const lote = parseArg('lote') ?? 'cuidados-na-administracao-de-medicamentos-g07';
  const batchSize = Number(parseArg('size') ?? '10');
  const reportPath = resolve(
    process.cwd(),
    'artifacts/cuidados-na-administracao-de-medicamentos-topic-cluster-report.json',
  );
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:cuidados-na-administracao-de-medicamentos antes.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { rows: ClusterRow[] };
  const exclude = loadExcludeSlugs(lote);
  const completoSlugs = loadCompletoSlugs();

  const pool: string[] = [];
  for (const row of report.rows) {
    if (row.pedagogical_cluster !== P0_CLUSTER) continue;
    if (!completoSlugs.has(row.modulo_slug)) continue;
    if (exclude.has(row.modulo_slug)) continue;
    pool.push(row.modulo_slug);
  }

  const picked = pool.slice(0, batchSize);
  if (picked.length === 0) {
    throw new Error(`Nenhum slug default disponível. pool=${pool.length}`);
  }

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  writeFileSync(
    loteManifestPath(lote),
    JSON.stringify(
      {
        lote,
        exported_at: new Date().toISOString(),
        source: 'cluster-report',
        filters: {
          cluster: P0_CLUSTER,
          pedagogical_branch_target: TARGET_BRANCH,
          exclude_count: exclude.size,
        },
        slugs: picked,
      },
      null,
      2,
    ),
    'utf8',
  );

  writeFileSync(
    resolve(loteDir, 'lote-meta.json'),
    JSON.stringify(
      {
        lote,
        subtopico: 'Cuidados na Administração de Medicamentos',
        status: 'planned',
        priority: 'P1 — cam_generico (Default cluster — lote 1/3)',
        slug_count: picked.length,
        pedagogical_branch_target: TARGET_BRANCH,
        anchors: [
          'examples/questao-premium-facet-cuidados-vigilancia-reacao-adversa.json',
          'examples/questao-premium-ameosc-cuidados-protocolo-ms-vf.json',
        ],
        anchor_slug: 'facet-enfermagem-cuidados-na-administracao-de-medicamentos-1778969710154-5',
        workflow: [
          'npm run plan:cuidados-na-administracao-de-medicamentos-g07',
          'npm run catalog:export-lote -- --lote=cuidados-na-administracao-de-medicamentos-g07 --from-manifest=data/catalog-migration/cuidados-na-administracao-de-medicamentos-g07/manifest.json',
          'Handcraft golden-v1 — bridge/center/cards/compare semântico',
          'npm run validate:goldens -- --lote=cuidados-na-administracao-de-medicamentos-g07 --strict',
          'npm run audit:questao-readiness -- --lote=cuidados-na-administracao-de-medicamentos-g07 --strict-v3-pedagogy',
          'npm run audit:slug-alignment -- --lote=cuidados-na-administracao-de-medicamentos-g07 --strict',
          'npm run audit:anchor-review -- --lote=cuidados-na-administracao-de-medicamentos-g07 --record-pass --reviewer=agent --skip-capture',
          'npm run catalog:apply-lote -- --lote=cuidados-na-administracao-de-medicamentos-g07 --apply',
        ],
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`[plan:cuidados-g07] lote=${lote} slugs=${picked.length} pool_remaining=${pool.length}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:cuidados-g07] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
