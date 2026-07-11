#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g42 — 8 slugs · 13º lote urgencias_generico (cauda cluster).
 * Slugs selecionados por: npx tsx scripts/plan-urgencias-g42.ts
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g42';
const COMPLETO = 'urgencias-e-emergencias-completo';

function main() {
  const planManifest = join(loteDir(LOTE), 'manifest.json');
  if (!existsSync(planManifest)) {
    console.error(`[init:urgencias-g42] Rode antes: npx tsx scripts/plan-urgencias-g42.ts`);
    process.exit(1);
  }
  const { slugs } = JSON.parse(readFileSync(planManifest, 'utf8')) as { slugs: string[] };
  if (slugs.length !== 8) {
    console.error(`[init:urgencias-g42] manifest deve ter 8 slugs, tem ${slugs.length}`);
    process.exit(1);
  }

  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g42] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g42] copied ${slug}`);
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
          batch: 'g42-generico-tail-batch-8',
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
          urgencias_generico: 8,
        },
        notes:
          'g42 — 13º lote cauda generico · ambulância tipo C salvamento · IC/EAP posição · TCE sinais · SAMU código amarelo 2 min · tipo D médico · TARM · APH Start · queda andaime TCE NÃO condiz',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g42] manifest + lote-meta OK (${slugs.length} slugs)`);
}

main();
