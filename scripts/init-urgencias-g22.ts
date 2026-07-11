#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g22 — 8 slugs engasgo/OVACE (lote 1 · urgencias_engasgo · 12/12).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g22';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6',
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-7',
  'fepese-enfermagem-urgencias-e-emergencias-1777103988389-9',
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-8',
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-3',
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006969552-0',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-2',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-6',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g22] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g22] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_engasgo',
          batch: 'g22-engasgo-lote-1',
        },
        slugs: SLUGS,
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
        slug_count: SLUGS.length,
        branches: { urgencias_engasgo: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json',
        ],
        notes:
          'g22 engasgo lote 1 — sinal universal FAU ×2 · Heimlich · OVACE criança · corpo estranho impactado · consulplan consciente',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g22] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
