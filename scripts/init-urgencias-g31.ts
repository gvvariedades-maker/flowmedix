#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g31 — 8 slugs · 2º lote urgencias_generico (cauda cluster).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g31';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'avancasp-enfermagem-urgencias-e-emergencias-1777104024064-5',
  'avancasp-enfermagem-urgencias-e-emergencias-1777104083571-4',
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003261833-4',
  'educa-pb-enfermagem-urgencias-e-emergencias-1777104070286-6',
  'facape-enfermagem-semiologia-em-enfermagem-1779563486900-8',
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-7',
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-5',
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-6',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g31] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g31] copied ${slug}`);
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
          batch: 'g31-generico-tail-batch-2',
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
          urgencias_generico: 6,
          urgencias_rcp_pediatrico: 1,
          urgencias_rcp_sbv: 1,
        },
        notes:
          'g31 — 2º lote cauda urgencias_generico · inferência: entorse crioterapia · RCP pediátrica VAA 2–3 s · primeiros socorros RCP · emergência vs urgência · triagem UBS · Glasgow · C/E USA/enfermeiro',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g31] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
