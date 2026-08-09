#!/usr/bin/env tsx
/**
 * Inicializa coleta-de-exames-laboratoriais-g10..g13 — copia slugs do export completo.
 * Atribuição: remaining[32..63] após reserva g06–g09.
 *
 *   npx tsx scripts/init-coleta-de-exames-laboratoriais-g10-g13.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const COMPLETO = 'coleta-de-exames-laboratoriais-completo';
const SUBTOPICO = 'Coleta de Exames Laboratoriais';

const BATCHES: Record<string, string[]> = {
  'coleta-de-exames-laboratoriais-g10': [
    'iaupe-enfermagem-exames-laboratoriais-1779563559434-8',
    'ibfc-enfermagem-coleta-de-exames-laboratoriais-1779563248005-3',
    'idecan-enfermagem-exames-complementares-1778712242196-2',
    'idecan-enfermagem-exames-complementares-1779563685104-2',
    'idecan-enfermagem-exames-laboratoriais-1778712242196-1',
    'idecan-enfermagem-exames-laboratoriais-1780066961947-6',
    'ieses-enfermagem-coleta-de-exames-laboratoriais-1779563248005-8',
    'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779562716126-2',
  ],
  'coleta-de-exames-laboratoriais-g11': [
    'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779562716126-3',
    'instituto-consulpam-enfermagem-exames-complementares-1779563674260-5',
    'instituto-verbena-enfermagem-coleta-de-exames-laboratoriais-1779563248005-6',
    'itame-enfermagem-exames-complementares-1779563679414-4',
    'ivin-enfermagem-exames-laboratoriais-1779563559434-6',
    'lj-assessoria-enfermagem-coleta-de-exames-laboratoriais-1779562768558-7',
    'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779562716126-8',
    'objetiva-concursos-enfermagem-exames-laboratoriais-1779563621885-7',
  ],
  'coleta-de-exames-laboratoriais-g12': [
    'selecon-enfermagem-exames-complementares-1779563674260-7',
    'unifil-enfermagem-coleta-de-exames-laboratoriais-1779562768558-0',
    'unifil-enfermagem-exames-laboratoriais-1779563646977-7',
    'univali-enfermagem-exames-complementares-1779563674260-1',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-8',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563248005-5',
    'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779563248005-2',
    'igeduc-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-7',
  ],
  'coleta-de-exames-laboratoriais-g13': [
    'lj-assessoria-enfermagem-coleta-de-exames-laboratoriais-1779563288910-6',
    'reis-e-reis-enfermagem-coleta-de-exames-laboratoriais-1779562768558-8',
    'selecon-enfermagem-coleta-de-exames-laboratoriais-1779563272300-0',
    'unifil-enfermagem-coleta-de-exames-laboratoriais-1779563288910-8',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562735777-0',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-7',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563200105-4',
    'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563272300-7',
  ],
};

function initLote(lote: string, slugs: string[]) {
  const outDir = loteQuestionsDir(lote);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:coleta-g10-g13] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:coleta-g10-g13] ${lote} copied ${slug}`);
  }

  writeFileSync(
    loteManifestPath(lote),
    `${JSON.stringify(
      {
        lote,
        exported_at: new Date().toISOString(),
        source: 'from-completo',
        parent: COMPLETO,
        filters: { slugs },
        slugs,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  writeFileSync(
    join(loteDir(lote), 'lote-meta.json'),
    `${JSON.stringify(
      {
        lote,
        mode: 'handcraft-golden-v1',
        created_at: '2026-08-06',
        subtopico: SUBTOPICO,
        total: slugs.length,
        status: 'handcraft_pending',
        slugs,
        golden_reference: 'examples/questao-premium-fau-coleta-generico.json',
        workflow: [
          `npx tsx scripts/handcraft-${lote}.ts`,
          `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
          `npm run catalog:apply-lote -- --lote=${lote} --apply`,
        ],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:coleta-g10-g13] ${lote} manifest + lote-meta OK (${slugs.length} slugs)`);
}

function main() {
  for (const [lote, slugs] of Object.entries(BATCHES)) {
    initLote(lote, slugs);
  }
  console.log('[init:coleta-g10-g13] done g10–g13');
}

main();
