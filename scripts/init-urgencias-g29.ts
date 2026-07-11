#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g29 — 2 slugs · micro-clusters drift (anafilaxia + queimadura no relatório).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g29';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fepese-enfermagem-urgencias-e-emergencias-1777103994618-1',
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-4',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g29] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g29] copied ${slug}`);
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
          pedagogical_branch: 'mixed_micro_cluster_drift',
          batch: 'g29-anafilaxia-queimadura-cluster-close',
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
        playbook_clusters_closed: {
          'Anafilaxia / epinefrina (relatório)': 1,
          'Queimadura — primeiro socorro (relatório)': 1,
        },
        anchors_used: [
          'examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json',
          'examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json',
        ],
        notes:
          'g29 micro-clusters — FEPESE choque hipovolêmico (drift anafilaxia · âncora P0 cpcon) · SELECON BT16 esmagamento (drift queimadura · âncora P0 ameosc) · handcraft por enunciado real',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g29] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
