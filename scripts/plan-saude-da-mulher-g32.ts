#!/usr/bin/env tsx
/**
 * Lote final absorbed — saude-da-mulher-g32 (4 slugs semiologia pré-natal).
 *
 *   npm run plan:saude-da-mulher-g32
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g32';

const PICKED = [
  'cotec-fadenor-enfermagem-saude-da-mulher-1777104301763-2',
  'cpcon-uepb-geral-saude-da-mulher-1777104382533-5',
  'educa-pb-enfermagem-saude-da-mulher-1777104408379-1',
  'iset-enfermagem-saude-da-mulher-1777104376057-0',
];

function main(): void {
  const loteDir = resolve(process.cwd(), 'data/catalog-migration', LOTE);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(LOTE), { recursive: true });

  writeFileSync(resolve(loteDir, 'g32-slugs.json'), JSON.stringify(PICKED, null, 2), 'utf8');

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'taxonomy-cc-from-saude-mulher-drift-absorbed.json',
    filters: { absorbed: true, branch_target: 'mulher_prenatal' },
    slugs: PICKED,
  };
  writeFileSync(loteManifestPath(LOTE), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote: LOTE,
    subtopico: 'Saúde da Mulher',
    status: 'planned',
    priority: 'P0 — absorbed semiologia pré-natal (fecha SM 246/246)',
    slug_count: PICKED.length,
    pedagogical_branch_target: 'mulher_prenatal',
    handcraft_grammar: 'data/catalog-migration/saude-da-mulher-pedagogy-errors.json',
    guideline: 'lib/guidelines/saudeMulher.ts',
    workflow: [
      'npm run plan:saude-da-mulher-g32',
      'npm run catalog:export-lote -- --lote=saude-da-mulher-g32 --from-manifest=data/catalog-migration/saude-da-mulher-g32/manifest.json',
      'npm run handcraft:saude-da-mulher-g32',
      'npm run audit:questao-readiness -- --lote=saude-da-mulher-g32 --strict-v3-pedagogy',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:saude-da-mulher-g32] lote=${LOTE} slugs=${PICKED.length}`);
  for (const s of PICKED) console.log(`  · ${s}`);
}

main();
