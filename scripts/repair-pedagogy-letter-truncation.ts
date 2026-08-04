#!/usr/bin/env tsx
/**
 * F3 #1 — truncagem: corta a cláusula final após `—` que julga alternativa por letra
 * no `concept_map` / `golden_rule`. A proposição removida já vive no `logic_flow`.
 *
 *   npm run repair:pedagogy-truncagem                       # âncoras, dry-run
 *   npm run repair:pedagogy-truncagem -- --write             # âncoras, escreve
 *   npm run repair:pedagogy-truncagem -- --lote=imunizacao-g01
 *   npm run repair:pedagogy-truncagem -- --catalog --limit=200
 *   npm run repair:pedagogy-truncagem -- --file=examples/questao-premium-x.json
 *
 * Âncoras primeiro; depois `npm run audit:blind-reader`; só então os lotes.
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { runPedagogyRepairCli } from './_pedagogy-repair-cli';

runPedagogyRepairCli({
  kind: 'letter_truncation',
  npmName: 'repair:pedagogy-truncagem',
  artifact: 'repair-pedagogy-letter-truncation',
});
