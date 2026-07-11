#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g02 — 8 slugs RCP/SBV adulto (lote 2 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g02.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g02';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** Próximos 8 slugs urgencias_rcp_sbv após g01 + âncoras (cluster report 2026-07-07). */
const SLUGS = [
  'furb-enfermagem-processo-de-enfermagem-1780011915153-0',
  'avancasp-enfermagem-urgencias-e-emergencias-1777103970505-1',
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-1',
  'gama-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-7',
  'funcern-enfermagem-urgencias-e-emergencias-1777104000896-4',
  'funcern-enfermagem-urgencias-e-emergencias-1777104007115-5',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-7',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-7',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g02] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g02] copied ${slug}`);
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
          batch: 'g02-rcp-adulto-lote-2',
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
          'g02 — 30:2 pré-VAA · ambulância tipo B · sequência C-A-B IDECAN · PCR intubado UTI · cadeia intra-hospitalar · vasopressor · carrinho/tábua · DEA FV/TVSP',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g02] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
