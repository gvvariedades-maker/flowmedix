#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g04 — 8 slugs RCP/SBV adulto (lote 4 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g04.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g04';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-2',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-3',
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006962671-9',
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-0',
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-1',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-6',
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-0',
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-2',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g04] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g04] copied ${slug}`);
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
          batch: 'g04-rcp-adulto-lote-4',
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
          'g04 — PCR gestante AHA · 2º elo cadeia intra-hospitalar · equipe PCREH AHA 2025 · V/F PCR · qualidade compressões SBC · cadeia extra-hospitalar · avaliação primária SBV · ritmo chocável FV',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g04] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
