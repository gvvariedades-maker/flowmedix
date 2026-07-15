#!/usr/bin/env tsx
/**
 * Fase A — auditoria ramos finos Vias: declared vs inferPedagogicalBranch.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

type Row = {
  slug: string;
  lote: string;
  declared: string;
  inferred: string;
  family?: string;
};

const LOTES = Array.from({ length: 26 }, (_, i) =>
  `vias-de-administracao-g${String(i + 1).padStart(2, '0')}`,
);

const mismatches: Row[] = [];
const distribution: Record<string, number> = {};

for (const lote of LOTES) {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
      meta?: { pedagogical_branch?: string; subtopico?: string; family?: string };
      question_data?: { instruction?: string };
      reverse_study_slides?: unknown[];
    };
    const declared = raw.meta?.pedagogical_branch?.trim() ?? '';
    const inferred = inferPedagogicalBranch(
      raw.meta?.subtopico ?? '',
      String(raw.question_data?.instruction ?? ''),
      (raw.reverse_study_slides ?? []) as never[],
      raw.meta?.family,
    );
    distribution[declared] = (distribution[declared] ?? 0) + 1;
    if (declared && inferred && declared !== inferred) {
      mismatches.push({
        slug,
        lote,
        declared,
        inferred,
        family: raw.meta?.family,
      });
    }
  }
}

const byTransition: Record<string, number> = {};
for (const m of mismatches) {
  const key = `${m.declared}→${m.inferred}`;
  byTransition[key] = (byTransition[key] ?? 0) + 1;
}

const out = {
  generated_at: new Date().toISOString(),
  subtopico: 'Vias de Administração',
  scanned_lotes: LOTES.length,
  distribution,
  mismatch_count: mismatches.length,
  by_transition: byTransition,
  mismatches,
};

const artifactsDir = resolve('artifacts');
mkdirSync(artifactsDir, { recursive: true });
const outPath = join(artifactsDir, 'vias-branch-audit-finos.json');
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');

console.log(`[audit-vias-branch-finos] mismatches=${mismatches.length} report=${outPath}`);
for (const [k, v] of Object.entries(byTransition)) {
  console.log(`  ${k}: ${v}`);
}
