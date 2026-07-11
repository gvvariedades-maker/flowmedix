#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g03 — 8 slugs RCP/SBV adulto (lote 3 do ramo).
 *
 *   npx tsx scripts/init-urgencias-g03.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g03';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'icece-enfermagem-urgencias-e-emergencias-1780001297464-0',
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-3',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-6',
  'igeduc-enfermagem-processo-de-enfermagem-1780011879977-1',
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-8',
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-2',
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-0',
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-3',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g03] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g03] copied ${slug}`);
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
          batch: 'g03-rcp-adulto-lote-3',
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
          'g03 — emergência×urgência · 30:2 solo · 100–120/min · conduta PCR AHA · DEA extra-hospitalar · qualidade compressões · V/F RCP · cadeia sobrevivência AHA 2025',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g03] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
