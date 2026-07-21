#!/usr/bin/env node
/** Gera scripts/curativos-handcraft-config.ts a partir do plano g02+ */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const plan = JSON.parse(
  readFileSync(join(process.cwd(), 'artifacts/curativos-lote-plan-g02plus.json'), 'utf8'),
);
const rows = JSON.parse(
  readFileSync(join(process.cwd(), 'artifacts/curativos-lote-plan.json'), 'utf8'),
).rows;

const slugBranch = Object.fromEntries(rows.map((r) => [r.slug, r.branch]));

const lotes = plan.lotes;
const loteEntries = Object.entries(lotes)
  .map(([lote, slugs]) => `  '${lote}': [\n${slugs.map((s) => `    '${s}',`).join('\n')}\n  ],`)
  .join('\n');

const branchEntries = Object.entries(slugBranch)
  .filter(([slug]) => !plan.g01_reserved.includes(slug))
  .map(([slug, branch]) => `  '${slug}': '${branch}',`)
  .join('\n');

const out = `/** AUTO-GENERATED — node scripts/generate-curativos-handcraft-config.mjs */
import type { CurativosBranchId } from '@/lib/catalogMigration/curativosPedagogy';

export const COMPLETO_LOTE = 'curativos-e-manejo-de-feridas-completo';

export const LOTE_SLUGS: Record<string, string[]> = {
${loteEntries}
};

export const SLUG_BRANCH: Record<string, CurativosBranchId> = {
${branchEntries}
};

export const ALL_LOTES_G02_PLUS = Object.keys(LOTE_SLUGS);
`;

writeFileSync(join(process.cwd(), 'scripts/curativos-handcraft-config.ts'), out, 'utf8');
console.log('Generated config:', Object.keys(lotes).length, 'lotes,', plan.remaining_count, 'slugs');
