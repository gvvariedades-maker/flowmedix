#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g10 — 8 slugs EXCETO/INCORRETA (1º lote urgencias_exceto_conduta).
 *
 *   npx tsx scripts/init-urgencias-g10.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g10';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-7',
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-2',
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-3',
  'fundatec-enfermagem-urgencias-e-emergencias-1777104007115-6',
  'gama-enfermagem-urgencias-e-emergencias-1777104031822-6',
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-4',
  'instituto-consulpam-enfermagem-exames-complementares-1779563674260-6',
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-5',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g10] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g10] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_exceto_conduta',
          batch: 'g10-exceto-conduta-lote-1',
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
        branches: { urgencias_exceto_conduta: SLUGS.length },
        anchors_used: ['examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json'],
        notes:
          'g10 EXCETO — TCE primária · objeto perfurante · fratura exposta fêmur · manobra cabeça-queixo · IAM oxigênio · triagem acolhimento · Glasgow EXCETO · ABCDE INCORRETA',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g10] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
