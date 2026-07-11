#!/usr/bin/env tsx
/**
 * Final handcraft lote — saude-da-mulher-g31 (3 slugs: ciclo + IST gestação).
 *
 *   npm run plan:saude-da-mulher-g31
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g31';

/** Últimos 3 slugs actionable após g30 (inventory 2026-07-10). */
const PICKED = [
  'legalle-enfermagem-processo-de-enfermagem-1780010579953-6',
  'unifil-enfermagem-processo-de-enfermagem-1780004452857-9',
  'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-4',
];

function main(): void {
  const loteDir = resolve(process.cwd(), 'data/catalog-migration', LOTE);
  mkdirSync(loteDir, { recursive: true });
  mkdirSync(loteQuestionsDir(LOTE), { recursive: true });

  writeFileSync(resolve(loteDir, 'g31-slugs.json'), JSON.stringify(PICKED, null, 2), 'utf8');

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'remaining-inventory',
    filters: { tail_final: true, branches: ['mulher_ciclo', 'mulher_ist_gestacao'] },
    slugs: PICKED,
  };
  writeFileSync(loteManifestPath(LOTE), JSON.stringify(manifest, null, 2), 'utf8');

  const loteMeta = {
    lote: LOTE,
    subtopico: 'Saúde da Mulher',
    status: 'planned',
    priority: 'P1 — tail final handcraft (ciclo + IST gestação)',
    slug_count: PICKED.length,
    pedagogical_branch_target: 'mulher_generico',
    handcraft_grammar: 'data/catalog-migration/saude-da-mulher-pedagogy-errors.json',
    guideline: 'lib/guidelines/saudeMulher.ts',
    workflow: [
      'npm run plan:saude-da-mulher-g31',
      'npm run catalog:export-lote -- --lote=saude-da-mulher-g31 --from-manifest=data/catalog-migration/saude-da-mulher-g31/manifest.json',
      'npm run handcraft:saude-da-mulher-g31',
      'npm run audit:questao-readiness -- --lote=saude-da-mulher-g31 --strict-v3-pedagogy',
    ],
  };
  writeFileSync(resolve(loteDir, 'lote-meta.json'), JSON.stringify(loteMeta, null, 2), 'utf8');

  console.log(`[plan:saude-da-mulher-g31] lote=${LOTE} slugs=${PICKED.length}`);
  for (const s of PICKED) console.log(`  · ${s}`);
}

main();
