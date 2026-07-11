#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g11 — 8 slugs EXCETO/INCORRETA (2º lote urgencias_exceto_conduta).
 *
 *   npx tsx scripts/init-urgencias-g11.ts
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g11';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-4',
  'fundatec-enfermagem-urgencias-e-emergencias-1777103994618-3',
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-2',
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-5',
  'instituto-consulpam-enfermagem-semiologia-em-enfermagem-1779563521756-1',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104056718-5',
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-7',
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-7',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  const keep = new Set(SLUGS.map((s) => `${s}.json`));
  for (const file of readdirSync(outDir)) {
    if (file.endsWith('.json') && !keep.has(file)) {
      unlinkSync(join(outDir, file));
      console.log(`[init:urgencias-g11] removed stale ${file}`);
    }
  }

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g11] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g11] copied ${slug}`);
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
          batch: 'g11-exceto-conduta-lote-2',
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
          'g11 EXCETO — crise hipertensiva INCORRETA · Manchester INCORRETA · convulsão INCORRETA (segurar) · convulsão EXCETO (objeto na boca) · TCE sinais EXCETO (logorreia) · síndrome compartimental EXCETO (pulso) · ABCDE mnemônico EXCETO · AVC hemorrágico EXCETO (trombos/êmbolos)',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g11] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
