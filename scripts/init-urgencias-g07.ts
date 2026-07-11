#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g07 — 8 slugs RCP/SBV adulto (lote 7 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g07.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g07';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** 6 slugs restantes do cluster rcp_sbv + 2 C/E RCP do pool genérico (instrução limpa). */
const SLUGS = [
  'ms-sarmento-enfermagem-vias-de-administracao-1778968646731-7',
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-3',
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-8',
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-3',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-4',
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-6',
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-8',
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-3',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g07] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g07] copied ${slug}`);
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
          batch: 'g07-rcp-adulto-lote-7',
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
          'g07 — SAVC acesso IV/IO · vasopressores PCR · vasopressor SAVC · ventilação pós-RCP SAMU · opioides naloxona · SAMU hipoglicemia · C/E superfície firme · C/E frequência compressões',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g07] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
