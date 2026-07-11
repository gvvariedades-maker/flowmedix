#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g13 — 1 slug EXCETO/INCORRETA (lote final urgencias_exceto_conduta).
 *
 *   npx tsx scripts/init-urgencias-g13.ts
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g13';
const COMPLETO = 'urgencias-e-emergencias-completo';

/** Único EXCETO restante no cluster (22 total) — não presente em g01–g12 manifests. */
const SLUGS = ['adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-5'];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  const keep = new Set(SLUGS.map((s) => `${s}.json`));
  for (const file of readdirSync(outDir)) {
    if (file.endsWith('.json') && !keep.has(file)) {
      unlinkSync(join(outDir, file));
      console.log(`[init:urgencias-g13] removed stale ${file}`);
    }
  }

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g13] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g13] copied ${slug}`);
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
          batch: 'g13-exceto-conduta-lote-final',
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
          'g13 EXCETO final — fratura exposta imobilização (âncora ADM&TEC) · 22/22 cluster EXCETO fechado',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g13] manifest + lote-meta OK (${SLUGS.length} slug)`);
}

main();
