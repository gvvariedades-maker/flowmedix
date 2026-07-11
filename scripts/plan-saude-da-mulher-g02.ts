#!/usr/bin/env tsx
/**
 * Seleciona slugs para saude-da-mulher-g02 (pré-natal P0) a partir do cluster report.
 *
 *   npm run plan:saude-da-mulher-g02
 *   npm run catalog:export-lote -- --lote=saude-da-mulher-g02 --slugs-file=data/catalog-migration/saude-da-mulher-g02/g02-slugs.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  BRANCH_CLUSTER,
  loadClusterRows,
  loadExcludeSlugs,
  slugsForBranch,
} from './lib/saude-da-mulher-plan';

function main(): void {
  const lote = parseArg('lote') ?? 'saude-da-mulher-g02';
  const batchSize = Number(parseArg('size') ?? '8');
  const branch = 'mulher_prenatal';

  const exclude = loadExcludeSlugs();
  const rows = loadClusterRows();
  const pool = slugsForBranch(rows, branch, exclude);

  if (pool.length < batchSize) {
    throw new Error(`Só ${pool.length} slugs pré-natal disponíveis (excluídos ${exclude.size}).`);
  }

  const picked = pool.slice(0, batchSize);

  const loteDir = resolve(process.cwd(), 'data/catalog-migration', lote);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(lote), { recursive: true });

  const slugsFile = resolve(loteDir, 'g02-slugs.json');
  writeFileSync(slugsFile, JSON.stringify(picked, null, 2), 'utf8');

  const manifest = {
    lote,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: {
      branch_id: branch,
      cluster: BRANCH_CLUSTER[branch],
      exclude_count: exclude.size,
    },
    slugs: picked,
  };
  writeFileSync(loteManifestPath(lote), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote,
    subtopico: 'Saúde da Mulher',
    status: 'planned',
    priority: 'P0 — pré-natal (~28,5% volume)',
    slug_count: picked.length,
    pedagogical_branch_target: branch,
    anchors: ['examples/questao-premium-cpcon-saude-mulher-pre-natal-vf.json'],
    anchor_slug: picked[0],
    handcraft_grammar: 'data/catalog-migration/saude-da-mulher-pedagogy-errors.json',
    guideline: 'lib/guidelines/saudeMulher.ts',
    notes:
      'Primeiro lote escalado pré-natal — gramática golden-v1 + pedagogy v3. Rodar export-lote depois deste plano.',
    workflow: [
      'npm run classify:saude-da-mulher-drift',
      'npm run plan:saude-da-mulher-g02',
      'npm run catalog:export-lote -- --lote=saude-da-mulher-g02 --from-manifest=data/catalog-migration/saude-da-mulher-g02/manifest.json',
      'Handcraft por slug — gramática saude-da-mulher-pedagogy-errors.json',
      'npm run audit:questao-readiness -- --lote=saude-da-mulher-g02 --strict-v3-pedagogy',
      'npm run audit:slug-alignment -- --lote=saude-da-mulher-g02 --strict',
      'npm run audit:numeric-factcheck -- --lote=saude-da-mulher-g02',
      'npm run capture:questao-review -- --lote=saude-da-mulher-g02',
      'npm run audit:anchor-review -- --lote=saude-da-mulher-g02 --record-pass --reviewer=pipeline',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:saude-da-mulher-g02] lote=${lote} branch=${branch} slugs=${picked.length}`);
  console.log(`[plan:saude-da-mulher-g02] slugs_file=${slugsFile}`);
  for (const s of picked) console.log(`  · ${s}`);
  console.log(
    `[plan:saude-da-mulher-g02] próximo: npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/${lote}/manifest.json`,
  );
}

main();
