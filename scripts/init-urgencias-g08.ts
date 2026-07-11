#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g08 — 8 slugs RCP/SBV adulto (lote 8 · penúltimo do ramo).
 *
 *   npx tsx scripts/init-urgencias-g08.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g08';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-3',
  'com-exam-pref-bauru-enfermagem-urgencias-e-emergencias-1777104056718-4',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-0',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-7',
  'furb-enfermagem-urgencias-e-emergencias-1777104012755-6',
  'quadrix-enfermagem-urgencias-e-emergencias-1780001220945-4',
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-5',
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-5',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g08] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g08] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_rcp_sbv',
          batch: 'g08-rcp-adulto-lote-8',
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
        branches: { urgencias_rcp_sbv: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json',
          'examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json',
          'examples/questao-premium-urgencias-rcp.json',
        ],
        notes:
          'g08 — ventilação PCR INCORRETA · qualidade RCP INCORRETA · SBV INCORRETA ×2 · posição RCP · cuidados pós-PCR · C/E DEA · C/E C-A-B',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g08] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
