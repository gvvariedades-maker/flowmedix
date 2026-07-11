#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g18 — 6 slugs XABCDE/trauma (lote final urgencias_xabcde_trauma · 22/22).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g18';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** Saldo reconciliado cluster report − g12 (8) − g17 (8) = 6 */
const SLUGS = [
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-0',
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-4',
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-0',
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-8',
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-9',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-0',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g18] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g18] copied ${slug}`);
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
          batch: 'g18-xabcde-trauma-lote-final',
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
          'g18 XABCDE final — obstrução VAA Heimlich · choque hipovolêmico hemorragia IV · TCE admissão coluna · APH ABC · prancha rígida coluna · síndrome compartimental dor pós-imobilização',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g18] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
