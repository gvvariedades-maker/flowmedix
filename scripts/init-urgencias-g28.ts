#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g28 — 4 slugs · urgencias_manchester_triagem · lote final 4/4.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g28';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780011967989-1',
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-7',
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008197597-9',
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-9',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g28] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g28] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_manchester_triagem',
          batch: 'g28-manchester-lote-final',
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
        branches: { urgencias_manchester_triagem: SLUGS.length },
        anchors_used: ['examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json'],
        notes:
          'g28 Manchester final — AMEOSC etiquetas massa · FUNDATEC origem militar · VERBENA dor torácica isquêmica · SELECON verde pouco urgente · cluster 4/4 fechado',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g28] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
