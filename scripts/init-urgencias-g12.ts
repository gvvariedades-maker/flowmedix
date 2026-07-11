#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g12 — 8 slugs XABCDE/trauma (1º lote urgencias_xabcde_trauma).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g12';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-7',
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-2',
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-3',
  'cotec-fadenor-enfermagem-urgencias-e-emergencias-1777104018306-8',
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-8',
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-2',
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-3',
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-4',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g12] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g12] copied ${slug}`);
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
          batch: 'g12-xabcde-trauma-lote-1',
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
          'g12 XABCDE — letra X hemorragia · compressão corte · X prioridade · VAA trauma · imobilização coluna · Glasgow D · hemorragia C · amputação controle',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g12] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
