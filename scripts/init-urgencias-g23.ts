#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g23 — 4 slugs engasgo/OVACE (lote final · urgencias_engasgo · 12/12).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g23';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'instituto-verbena-enfermagem-urgencias-e-emergencias-1777104031822-2',
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008210115-7',
  'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056600234-9',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-4',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g23] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g23] copied ${slug}`);
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
          batch: 'g23-engasgo-lote-final',
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
          'g23 engasgo final — Heimlich consciente Verbena/Sarmento · técnica VUNESP · OVACE grave domiciliar (cluster 12/12 fechado)',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g23] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
