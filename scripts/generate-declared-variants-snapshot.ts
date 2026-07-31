/**
 * Gera snapshot estático de layoutVariants (evita fs scan no bundle RSC/NFT).
 * Run: npx tsx scripts/generate-declared-variants-snapshot.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { listDeclaredVariantsByScan } from '../lib/neurocanvas/declaredVariantsScan';

const out = resolve(process.cwd(), 'lib/neurocanvas/declaredVariants.snapshot.json');
const list = listDeclaredVariantsByScan();
writeFileSync(out, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
console.log(`Wrote ${list.length} entries → ${out}`);
