#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g24 — 8 slugs RCP pediátrica (1º lote · urgencias_rcp_pediatrico · 8/9).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g24';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-6',
  'avancasp-geral-urgencias-e-emergencias-1777104083571-3',
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-3',
  'fcpc-enfermagem-processo-de-enfermagem-1780004628956-5',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-2',
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1',
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-4',
  'quadrix-enfermagem-urgencias-e-emergencias-1777103988389-7',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g24] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g24] copied ${slug}`);
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
          batch: 'g24-rcp-pediatrico-lote-1',
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
          'g24 RCP pediátrica — VF adulto contraste · AHA gravidez · anafilaxia ped CPCON · 30:2 isolado FCPC · 30:2 adulto IDIB · Access 15:2 · Consulpam conceito · Quadrix afogamento',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g24] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
