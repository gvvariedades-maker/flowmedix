#!/usr/bin/env tsx
/**
 * Seleciona slugs para saude-da-mulher-g28 (mulher_generico — conceito geral).
 *
 *   npm run plan:saude-da-mulher-g28
 *   npm run catalog:export-lote -- --lote=saude-da-mulher-g28 --from-manifest=data/catalog-migration/saude-da-mulher-g28/manifest.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { loadClusterRows, loadExcludeSlugs, slugsForBranch } from './lib/saude-da-mulher-plan';

const CONCEITO_GERAL = 'Saúde da mulher — conceito geral';

function main(): void {
  const lote = parseArg('lote') ?? 'saude-da-mulher-g28';
  const batchSize = Number(parseArg('size') ?? '8');
  const branch = 'mulher_generico';

  const exclude = loadExcludeSlugs();
  const rows = loadClusterRows();
  const poolAll = slugsForBranch(rows, branch, exclude);

  const conceito = poolAll.filter((slug) => {
    const row = rows.find((r) => r.slug === slug);
    return row?.topic === CONCEITO_GERAL;
  });
  const rest = poolAll.filter((slug) => !conceito.includes(slug));
  const pool = [...conceito, ...rest];

  if (pool.length === 0) {
    throw new Error(`Nenhum slug ${branch} disponível (excluídos ${exclude.size}).`);
  }

  const picked = pool.slice(0, Math.min(batchSize, pool.length));

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g28-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      branch_id: branch,
      topic_priority: CONCEITO_GERAL,
      exclude_count: exclude.size,
      pool_remaining: pool.length - picked.length,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Saúde da Mulher',
    status: 'planned',
    priority: 'P1 — mulher_generico (conceito geral + residual)',
    slug_count: picked.length,
    pedagogical_branch_target: branch,
    handcraft_grammar: 'data/catalog-migration/saude-da-mulher-pedagogy-errors.json',
    guideline: 'lib/guidelines/saudeMulher.ts',
    notes:
      'Lote genérico — moldes morphological/reference_table/vertical/compare; drift excluído via classify.',
    workflow: [
      'npm run plan:saude-da-mulher-g28',
      'npm run catalog:export-lote -- --lote=saude-da-mulher-g28 --from-manifest=data/catalog-migration/saude-da-mulher-g28/manifest.json',
      'npm run handcraft:saude-da-mulher-g28',
      'npm run audit:questao-readiness -- --lote=saude-da-mulher-g28 --strict-v3-pedagogy',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:saude-da-mulher-g28] lote=${lote} branch=${branch} slugs=${picked.length}`);
  console.log(`[plan:saude-da-mulher-g28] pool_total=${pool.length} conceito_geral=${conceito.length}`);
  console.log(`[plan:saude-da-mulher-g28] slugs_file=${slugsFile}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:saude-da-mulher-g28] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
