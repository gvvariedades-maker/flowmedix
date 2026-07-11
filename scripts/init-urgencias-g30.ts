#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g30 — 8 slugs · 1º lote urgencias_generico (cauda cluster).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g30';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-1',
  'amauc-enfermagem-processo-de-enfermagem-1780002441285-5',
  'amauc-enfermagem-processo-de-enfermagem-1780002549800-3',
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-8',
  'avancasp-enfermagem-processo-de-enfermagem-1780002834059-5',
  'avancasp-enfermagem-processo-de-enfermagem-1780003137298-6',
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-0',
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563480978-1',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g30] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g30] copied ${slug}`);
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
          batch: 'g30-generico-tail-batch-1',
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
          urgencias_generico: 7,
          urgencias_xabcde_trauma: 1,
        },
        notes:
          'g30 — 1º lote cauda urgencias_generico (137–145 restantes) · inferência por enunciado: trauma ABC + fratura exposta → xabcde_trauma · demais generico',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g30] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
