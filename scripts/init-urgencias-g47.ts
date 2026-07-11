#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g47 — 8 slugs · 18º lote (reconcile outside-tail).
 * Slugs selecionados por: npx tsx scripts/plan-urgencias-g47.ts
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g47';
const COMPLETO = 'urgencias-e-emergencias-completo';

function main() {
  const planManifest = join(loteDir(LOTE), 'manifest.json');
  if (!existsSync(planManifest)) {
    console.error(`[init:urgencias-g47] Rode antes: npx tsx scripts/plan-urgencias-g47.ts`);
    process.exit(1);
  }
  const { slugs } = JSON.parse(readFileSync(planManifest, 'utf8')) as { slugs: string[] };
  if (slugs.length !== 8) {
    console.error(`[init:urgencias-g47] manifest deve ter 8 slugs, tem ${slugs.length}`);
    process.exit(1);
  }

  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g47] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g47] copied ${slug}`);
  }

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
          urgencias_rcp_sbv: 2,
          urgencias_xabcde_trauma: 1,
          urgencias_vf_protocolo: 1,
          urgencias_engasgo: 1,
          urgencias_generico: 1,
          urgencias_convulsao: 1,
          urgencias_choque: 1,
        },
        notes:
          'g47 — 18º lote reconcile outside-tail · tail generico esgotado · 2 rcp + trauma VF + TEP VF + OVACE + ambulância + convulsão + choque elétrico · 2 slugs restantes → g48',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g47] manifest + lote-meta OK (${slugs.length} slugs)`);
}

main();
