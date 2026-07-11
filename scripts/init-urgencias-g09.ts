#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g09 — 2 slugs finais RCP/SBV (duplicatas canônicas em g24/g31).
 *
 *   npx tsx scripts/init-urgencias-g09.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g09';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** Pool RCP/SBV não coberto em g01–g08 — instrução sem drift engasgo/choque/adrenalina. */
const SLUGS = ['igeduc-enfermagem-urgencias-e-emergencias-1777104070286-7'];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g09] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g09] copied ${slug}`);
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
          batch: 'g09-rcp-adulto-lote-final',
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
          'g09 final RCP/SBV — AHA 2020 PCR gestante · VAA pós-intubação C/E · USA/SBV pré-hospitalar C/E · RCP extra-hospitalar',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g09] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
