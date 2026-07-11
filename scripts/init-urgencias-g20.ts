#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g20 — 8 slugs choque/hipoperfusão (lote 2 · urgencias_choque · 18/18).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g20';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-8',
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-4',
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-6',
  'idib-enfermagem-questoes-mescladas-e-outras-doencas-agudas-1778934918280-2',
  'idib-enfermagem-urgencias-e-emergencias-1778934936220-0',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-5',
  'instituto-verbena-enfermagem-semiologia-em-enfermagem-1779563531989-5',
  'quadrix-enfermagem-semiologia-em-enfermagem-1779563537258-8',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g20] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g20] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_choque',
          batch: 'g20-choque-lote-2',
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
        branches: { urgencias_choque: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-admtec-urgencias-choque-eletrico.json',
          'examples/questao-premium-fepese-urgencias-choque-hipovolemico.json',
        ],
        notes:
          'g20 choque lote 2 — cardiogênico · séptico vasopressina · hematêmese hipovolêmico · distributivo · IRA gravidade · elétrico Consulplan · organofosforado · hemorragia II-IV',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g20] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
