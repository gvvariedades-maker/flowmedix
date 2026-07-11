#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g45 — 8 slugs · 16º lote urgencias_generico (cauda cluster).
 * Slugs selecionados por: npx tsx scripts/plan-urgencias-g45.ts
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g45';
const COMPLETO = 'urgencias-e-emergencias-completo';

function main() {
  const planManifest = join(loteDir(LOTE), 'manifest.json');
  if (!existsSync(planManifest)) {
    console.error(`[init:urgencias-g45] Rode antes: npx tsx scripts/plan-urgencias-g45.ts`);
    process.exit(1);
  }
  const { slugs } = JSON.parse(readFileSync(planManifest, 'utf8')) as { slugs: string[] };
  if (slugs.length !== 8) {
    console.error(`[init:urgencias-g45] manifest deve ter 8 slugs, tem ${slugs.length}`);
    process.exit(1);
  }

  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g45] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g45] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_generico',
          batch: 'g45-generico-tail-batch-8',
        },
        slugs,
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
        slug_count: slugs.length,
        branches_planned: {
          urgencias_generico: 7,
          urgencias_xabcde_trauma: 1,
        },
        notes: 'g45 — 16º lote cauda generico · pending handcraft',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g45] manifest + lote-meta OK (${slugs.length} slugs)`);
}

main();
