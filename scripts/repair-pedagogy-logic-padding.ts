#!/usr/bin/env tsx
/**
 * F3 #2 — padding: funde `Confirmar:` + `Marcar` no `logic_flow`, preservando o passo
 * `Fixação:` e o passo que localiza o gabarito.
 *
 *   npm run repair:pedagogy-padding                          # âncoras, dry-run
 *   npm run repair:pedagogy-padding -- --write
 *   npm run repair:pedagogy-padding -- --lote=imunizacao-g01 --write
 *   npm run repair:pedagogy-padding -- --catalog --limit=200
 *
 * Âncoras primeiro; depois `npm run audit:blind-reader`; só então os lotes.
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { runPedagogyRepairCli } from './_pedagogy-repair-cli';

runPedagogyRepairCli({
  kind: 'logic_padding',
  npmName: 'repair:pedagogy-padding',
  artifact: 'repair-pedagogy-logic-padding',
});
