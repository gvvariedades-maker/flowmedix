#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g26 — 8 slugs V/F protocolo (lote final · urgencias_vf_protocolo · 8/8).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g26';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-5',
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-1',
  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-7',
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-1',
  'gama-enfermagem-urgencias-e-emergencias-1777104031822-5',
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-1',
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-3',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-6',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g26] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g26] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_vf_protocolo',
          batch: 'g26-vf-protocolo-lote-final',
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
        branches: { urgencias_vf_protocolo: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json',
          'examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json',
        ],
        notes:
          'g26 V/F protocolo final — imobilização AMEOSC · vasoativas COTEC · dor torácica CPCON · convulsão CPCON (vf) · trauma pélvico GAMA · primeiros socorros IGEDUC ×2 · SAMU Consulplan · cluster 8/8 fechado',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g26] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
