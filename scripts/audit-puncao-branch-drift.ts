#!/usr/bin/env tsx
/** Audit assigned vs inferred pedagogical_branch — Punção onda 2. */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';
import { PUNCAO_SUBTOPICO } from '@/lib/catalogMigration/puncaoPedagogy';

type Row = {
  slug: string;
  lote: string;
  assigned: string;
  inferred: string;
  family?: string;
};

const rows: Row[] = [];
const byAssigned: Record<string, number> = {};
const byInferred: Record<string, number> = {};

for (let i = 1; i <= 15; i++) {
  const lote = `puncao-venosa-e-cuidados-com-cateteres-g${String(i).padStart(2, '0')}`;
  const dir = join('data/catalog-migration', lote, 'questions');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
      modulo_slug?: string;
      meta?: { pedagogical_branch?: string; family?: string };
      question_data?: { instruction?: string; options?: { text?: string }[] };
    };
    const slug = q.modulo_slug ?? f.replace(/\.json$/, '');
    const assigned = q.meta?.pedagogical_branch ?? '';
    const instruction = q.question_data?.instruction ?? '';
    const slides = (q as { reverse_study_slides?: unknown[] }).reverse_study_slides ?? [];
    const inferred =
      inferPedagogicalBranch(
        PUNCAO_SUBTOPICO,
        instruction,
        slides as never,
        q.meta?.family as never,
      ) ?? '';
    byAssigned[assigned] = (byAssigned[assigned] ?? 0) + 1;
    byInferred[inferred] = (byInferred[inferred] ?? 0) + 1;
    rows.push({ slug, lote, assigned, inferred, family: q.meta?.family });
  }
}

const mismatches = rows.filter((r) => r.assigned !== r.inferred);
const thin = ['puncao_tempo', 'puncao_ipcs_cvc', 'puncao_exceto'];

const out = {
  generated_at: new Date().toISOString(),
  subtopico: PUNCAO_SUBTOPICO,
  total: rows.length,
  by_assigned: byAssigned,
  by_inferred: byInferred,
  mismatch_count: mismatches.length,
  mismatches,
  thin_branch_assigned: Object.fromEntries(
    thin.map((b) => [b, rows.filter((r) => r.assigned === b).map((r) => r.slug)]),
  ),
  thin_branch_inferred: Object.fromEntries(
    thin.map((b) => [b, rows.filter((r) => r.inferred === b).map((r) => r.slug)]),
  ),
};

const outDir = resolve(process.cwd(), 'artifacts');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'puncao-onda2-branch-audit.json');
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`[audit-puncao-branch] total=${rows.length} mismatches=${mismatches.length}`);
console.log('[audit-puncao-branch] assigned', byAssigned);
console.log('[audit-puncao-branch] inferred', byInferred);
console.log(`[audit-puncao-branch] report=${outPath}`);
