#!/usr/bin/env tsx
/** CLI — handcraft Processo de Enfermagem (SAE). --lote=... ou --all */
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { handcraftLote } from '@/scripts/handcraft-processo-de-enfermagem-core';
import { LOTE_SLUGS } from '@/scripts/sae-handcraft-config';

const all = process.argv.includes('--all');
const lote = parseArg('lote');

if (all) {
  let total = 0;
  for (const l of Object.keys(LOTE_SLUGS)) total += handcraftLote(l);
  console.log(`[handcraft:sae] ALL total=${total}`);
} else if (lote) {
  handcraftLote(lote);
} else {
  throw new Error('Use --lote=processo-de-enfermagem-gNN ou --all');
}
