#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g21 — 2 slugs choque/hipoperfusão (lote final · urgencias_choque · 18/18).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g21';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'vunesp-enfermagem-exames-complementares-1779424094915-0',
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563491765-3',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g21] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g21] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_choque',
          batch: 'g21-choque-lote-final',
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
        branches: { urgencias_choque: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-fepese-urgencias-choque-hipovolemico.json',
        ],
        notes:
          'g21 choque final — hipernatremia desidratação idoso · sinal choque hipovolêmico pele fria (cluster 18/18 fechado)',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g21] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
