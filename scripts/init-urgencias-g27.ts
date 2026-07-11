#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g27 — 7 slugs · urgencias_convulsao · lote final 7/7.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g27';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-8',
  'fauel-enfermagem-urgencias-e-emergencias-1777104024064-0',
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-4',
  'funtef-enfermagem-urgencias-e-emergencias-1777103970505-2',
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-0',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104048047-7',
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-1',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g27] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g27] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_convulsao',
          batch: 'g27-convulsao-lote-final',
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
        branches: { urgencias_convulsao: SLUGS.length },
        anchors_used: ['examples/questao-premium-admtec-urgencias-convulsao-crise.json'],
        notes:
          'g27 convulsão final — ADM&TEC objeto boca · FAUEL envenenamento infantil · FEPESE lateralizar · FUNTEF UBS adolescente · IVIN hipoglicemia · VUNESP Heimlich × convulsão · VUNESP orientações SAMU · cluster 7/7 fechado',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g27] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
