#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g48 — 7 slugs · lote FINAL (340/340).
 * Slugs selecionados por: npx tsx scripts/plan-urgencias-g48.ts
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g48';
const COMPLETO = 'urgencias-e-emergencias-completo';

function main() {
  const planManifest = join(loteDir(LOTE), 'manifest.json');
  if (!existsSync(planManifest)) {
    console.error(`[init:urgencias-g48] Rode antes: npx tsx scripts/plan-urgencias-g48.ts`);
    process.exit(1);
  }
  const { slugs } = JSON.parse(readFileSync(planManifest, 'utf8')) as { slugs: string[] };
  if (slugs.length !== 7) {
    console.error(`[init:urgencias-g48] manifest deve ter 7 slugs, tem ${slugs.length}`);
    process.exit(1);
  }

  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g48] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g48] copied ${slug}`);
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
          batch: 'g48-final-close-340',
          remaining_count: slugs.length,
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
        slug_count: 7,
        branches_planned: {
          urgencias_rcp_sbv: 2,
          urgencias_generico: 4,
          urgencias_engasgo: 1,
        },
        notes:
          'g48 — FINAL lote 7 slugs → 340/340 · ibade+selecon rcp_sbv · ibfc+idib+legalle generico · aocp engasgo · consulplan generico ambulância',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g48] manifest + lote-meta OK (${slugs.length} slugs · FINAL)`);
}

main();
