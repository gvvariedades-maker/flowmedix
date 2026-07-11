#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g49 — 3 slugs órfãos · reconcile micro-lote (339/339).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g49';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'vunesp-enfermagem-processo-de-enfermagem-1780003637054-7',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103981770-6',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-6',
] as const;

function main() {
  if (SLUGS.length !== 3) {
    console.error(`[init:urgencias-g49] esperado 3 slugs, tem ${SLUGS.length}`);
    process.exit(1);
  }

  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g49] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g49] copied ${slug}`);
  }

  writeFileSync(
    loteManifestPath(LOTE),
    `${JSON.stringify(
      {
        lote: LOTE,
        exported_at: new Date().toISOString(),
        source: `data/catalog-migration/${COMPLETO}/manifest.json`,
        filters: {
          subtopico: 'Urgências e Emergências',
          batch: 'g49-orphan-reconcile-339',
          orphan_reconcile: true,
          remaining_count: SLUGS.length,
        },
        slugs: [...SLUGS],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  writeFileSync(
    join(loteDir(LOTE), 'lote-meta.json'),
    `${JSON.stringify(
      {
        lote: LOTE,
        subtopico: 'Urgências e Emergências',
        status: 'handcraft_pending',
        handcraft_at: null,
        handcraft_by: null,
        slug_count: 3,
        branches_planned: {
          urgencias_choque: 1,
          urgencias_generico: 2,
        },
        notes:
          'g49 — orphan-reconcile micro-lote · 3 slugs ausentes de g48 · choque elétrico (E) · embolia gasosa VM (A) · TVP pós-op panturrilha (B) → 339/339',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g49] manifest + lote-meta OK (${SLUGS.length} slugs · orphan reconcile)`);
}

main();
