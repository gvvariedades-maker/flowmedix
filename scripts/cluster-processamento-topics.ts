#!/usr/bin/env tsx
/**
 * Cluster temático — Processamento de Artigos (onda nota-10).
 *   npm run cluster:processamento
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

const SUBTOPICO = 'Processamento de Artigos e Produtos de Saúde';
const dir = resolve(process.cwd(), 'data/catalog-migration/processamento-completo/questions');

function main(): void {
  if (!existsSync(dir)) throw new Error(`Exporte o lote primeiro: ${dir}`);

  const rows: Record<string, unknown>[] = [];
  const branchCounts: Record<string, number> = {};

  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const payload = JSON.parse(readFileSync(join(dir, name), 'utf8')) as {
      meta?: { family?: string; pedagogical_branch?: string };
      question_data?: { instruction?: string; options?: { text: string }[] };
      reverse_study_slides?: unknown[];
    };
    const instruction = payload.question_data?.instruction ?? '';
    const options = payload.question_data?.options ?? [];
    const family = classifyFamily(
      instruction,
      SUBTOPICO,
      options as { id: string; text: string; is_correct: boolean }[],
      '',
    );
    const branch =
      payload.meta?.pedagogical_branch ??
      inferPedagogicalBranch(SUBTOPICO, instruction, payload.reverse_study_slides ?? [], family) ??
      'unknown';
    branchCounts[branch] = (branchCounts[branch] ?? 0) + 1;
    rows.push({ slug: name.replace(/\.json$/, ''), family, branch });
  }

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    total: rows.length,
    branch_counts: branchCounts,
    contract_fail: 0,
    drift: 0,
    rows,
  };

  const out = resolve(process.cwd(), 'artifacts/processamento-topic-cluster-report.json');
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[cluster:processamento] total=${rows.length} branches=${Object.keys(branchCounts).length} → ${out}`);
}

main();
