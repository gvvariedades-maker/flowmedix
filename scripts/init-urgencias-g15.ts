#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g15 — 8 slugs AVC/IAM (2º lote urgencias_avc_iam).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g15';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-5',
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-6',
  'idib-enfermagem-acidente-vascular-cerebral-avc-1778934918280-1',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-8',
  'selecon-enfermagem-semiologia-em-enfermagem-1779563537258-1',
  'legalle-enfermagem-processo-de-enfermagem-1780010905023-8',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-3',
  'funcern-enfermagem-urgencias-e-emergencias-1777104007115-4',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g15] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g15] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_avc_iam',
          batch: 'g15-avc-iam-lote-2',
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
        branches: { urgencias_avc_iam: SLUGS.length },
        anchors_used: ['examples/questao-premium-amauc-urgencias-cincinnati-avc.json'],
        notes:
          'g15 AVC/IAM — admissão AVE técnico · caso Marcos IAM · linha cuidado MS exclusão · condutas auxiliar IAM · sinais AVC semiologia · tipos isquêmico/hemorrágico · clopidogrel transporte · IAM dor torácica',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g15] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
