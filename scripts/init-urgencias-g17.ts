#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g17 — 8 slugs XABCDE/trauma (2º lote urgencias_xabcde_trauma).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g17';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** Saldo cluster 22 − g12 (8) = 14; g17 seleciona 8 · g18 fecha com 6 */
const SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-5',
  'facet-geral-urgencias-e-emergencias-1777103976379-4',
  'fgv-enfermagem-urgencias-e-emergencias-1777104056718-6',
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-2',
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-3',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-5',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-5',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-5',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g17] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g17] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_xabcde_trauma',
          batch: 'g17-xabcde-trauma-lote-2',
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
        branches: { urgencias_xabcde_trauma: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-ameosc-urgencias-trauma-queimadura.json',
          'examples/questao-premium-selecon-urgencias-bt16-esmagamento.json',
          'examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json',
        ],
        notes:
          'g17 XABCDE lote 2 — queimadura APH · ABCDE letra A · VF coluna/jaw thrust/TEC · jaw thrust cervical · politrauma compressão · segurança cena extremidades · colar SAMU · X-ABCDE letra X',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g17] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
