#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g25 — 1 slug RCP pediátrica (lote final · urgencias_rcp_pediatrico · 9/9).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g25';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'vunesp-enfermagem-urgencias-e-emergencias-1777104012755-0',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-3',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g25] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g25] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_rcp_pediatrico',
          batch: 'g25-rcp-pediatrico-lote-final',
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
        branches: { urgencias_rcp_pediatrico: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json',
          'examples/questao-premium-consulpam-urgencias-pcr-pediatrica-conceito.json',
        ],
        notes:
          'g25 RCP pediátrica final — VUNESP engasgo escolar sem pulso · compressões alta qualidade 100–120/min · cluster 9/9 fechado',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g25] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
