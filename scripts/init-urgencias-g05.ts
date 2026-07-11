#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g05 — 8 slugs RCP/SBV adulto (lote 5 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g05.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g05';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-9',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-9',
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6',
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-0',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104077075-9',
  'quadrix-enfermagem-urgencias-e-emergencias-1780001220945-5',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-7',
  'unifil-enfermagem-processo-de-enfermagem-1780004469060-1',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g05] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g05] copied ${slug}`);
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
          batch: 'g05-rcp-adulto-lote-5',
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
          'g05 — PCR emergência · naloxona opioides · AHA 2020 30:2 · identificação PCR · AHA 2020 qualidade compressões · 30:2 extra-hospitalar · SBV monitorização · ILCOR RCP mecânica',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g05] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
