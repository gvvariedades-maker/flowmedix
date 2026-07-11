#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g32 — 8 slugs · 3º lote urgencias_generico (cauda cluster).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g32';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9',
  'ameosc-enfermagem-processo-de-enfermagem-1780005556782-6',
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-3',
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-4',
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-4',
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-0',
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-4',
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006480333-1',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g32] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g32] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_generico',
          batch: 'g32-generico-tail-batch-3',
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
        branches_planned: {
          urgencias_generico: 3,
          urgencias_avc_iam: 1,
          urgencias_rcp_sbv: 3,
          urgencias_xabcde_trauma: 1,
        },
        notes:
          'g32 — 3º lote cauda urgencias_generico · inferência: Cincinnati → avc · VF primeiros socorros + PCR → rcp_sbv · BT1 segurança → trauma · Glasgow · transfusão · alta UTI · responsividade/acionamento',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g32] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
