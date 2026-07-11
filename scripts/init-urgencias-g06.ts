#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g06 — 8 slugs RCP/SBV adulto (lote 6 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g06.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g06';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'unifil-enfermagem-urgencias-e-emergencias-1777104012755-2',
  'univali-enfermagem-processo-de-enfermagem-1780010905023-6',
  'unesc-enfermagem-urgencias-e-emergencias-1780001220945-6',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104000896-0',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-0',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-1',
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-8',
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-2',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g06] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g06] copied ${slug}`);
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
          batch: 'g06-rcp-adulto-lote-6',
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
          'g06 — 30:2 dois socorristas · sequência RCP hospitalar · pulso carotídeo · qualidade compressões · UBS PCR · trauma SBV 1º passo · DEA técnico · Ambu com reservatório O2',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g06] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
