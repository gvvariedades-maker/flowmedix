#!/usr/bin/env tsx
/**
 * F3 #4 — gabarito_item: remove cards `Gabarito` / `Letra X` do concept_map e golden_rule,
 * e corta sufixos (`Núcleo da letra A.`, `→ letra C.`, `— … na letra A.`).
 *
 *   npm run repair:pedagogy-gabarito-item                       # âncoras, dry-run
 *   npm run repair:pedagogy-gabarito-item -- --write             # âncoras, escreve
 *   npm run repair:pedagogy-gabarito-item -- --lote=imunizacao-g01
 *   npm run repair:pedagogy-gabarito-item -- --file=examples/questao-premium-x.json
 *
 * Âncoras primeiro; depois `npm run audit:blind-reader`; só então os lotes.
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { runPedagogyRepairCli } from './_pedagogy-repair-cli';

runPedagogyRepairCli({
  kind: 'gabarito_item',
  npmName: 'repair:pedagogy-gabarito-item',
  artifact: 'repair-pedagogy-gabarito-item',
});
