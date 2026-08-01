#!/usr/bin/env tsx
/**
 * F3 #3 — rótulos V/F: remove veredito inicial (`FALSA.` / `VERDADEIRA.`) e o prefixo
 * `Afirmativa N — ` dos labels do `concept_map` / `golden_rule`.
 *
 *   npm run repair:pedagogy-rotulos-vf                       # âncoras, dry-run
 *   npm run repair:pedagogy-rotulos-vf -- --write
 *   npm run repair:pedagogy-rotulos-vf -- --lote=imunizacao-g01 --write
 *
 * Faixa **não** puramente aditiva: amostrar o diff humanamente antes de propagar aos
 * lotes. Âncoras primeiro; depois `npm run audit:blind-reader`.
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { runPedagogyRepairCli } from './_pedagogy-repair-cli';

runPedagogyRepairCli({
  kind: 'vf_label',
  npmName: 'repair:pedagogy-rotulos-vf',
  artifact: 'repair-pedagogy-vf-labels',
});
