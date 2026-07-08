#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g01 — copia 8 slugs RCP adulto do export completo.
 *
 *   npx tsx scripts/init-urgencias-g01.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g01';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-5',
  'cpcon-enfermagem-urgencias-e-emergencias-rcp-premium-pilot',
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-6',
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-3',
  'iaupe-enfermagem-urgencias-e-emergencias-1777104012755-1',
  'fauel-enfermagem-urgencias-e-emergencias-1777104018306-9',
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-2',
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-1',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g01] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g01] copied ${slug}`);
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
          batch: 'g01-piloto-rcp-adulto',
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
          'Piloto g01 — RCP/SBV adulto: compressões prioritárias · V/F pulso · cadeia · gestante · VAA pós-intubação',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g01] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
