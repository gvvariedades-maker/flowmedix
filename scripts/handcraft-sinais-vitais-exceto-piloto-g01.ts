#!/usr/bin/env tsx
/**
 * Sincroniza âncora EXCETO/INCORRETA — sinais-vitais-exceto-piloto-g01
 * Fonte: examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOTE = 'sinais-vitais-exceto-piloto-g01';
const SLUG = 'avancasp-enfermagem-verificacao-de-sinais-vitais-1778969745165-2';
const SRC = join(process.cwd(), 'examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json');
const DIR = join(process.cwd(), 'data/catalog-migration', LOTE, 'questions');

mkdirSync(DIR, { recursive: true });
copyFileSync(SRC, join(DIR, `${SLUG}.json`));
console.log(`[handcraft:sv-exceto-piloto] OK ${SLUG}`);
