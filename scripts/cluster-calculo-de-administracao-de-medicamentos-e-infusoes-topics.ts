#!/usr/bin/env tsx
/**
 * Clusteriza questões de Cálculo de Administração de Medicamentos e Infusões.
 *
 * Uso:
 *   npm run cluster:calculo-de-administracao-de-medicamentos-e-infusoes
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Cálculo de Administração de Medicamentos e Infusões';
const CANONICAL_MANIFEST =
  'data/catalog-migration/calculo-de-administracao-de-medicamentos-e-infusoes-completo/manifest.json';

const L3_DECISIONS: Record<string, string> = {
  calc_dose_equivalencia: 'molde_redesign',
  calc_conceito: 'ok_generico',
  calc_generico: 'ok_generico',
};

const STRONG_THRESHOLD = (total: number) => Math.max(5, Math.ceil(total * 0.1));

type Row = {
  slug: string;
  family: FamilyId;
  pedagogical_branch: string;
  l3_decision: string;
  is_strong_branch: boolean;
  instruction_preview: string;
};

function loadSlugs(): string[] {
  const manifestPath = resolve(process.cwd(), parseArg('manifest') ?? CANONICAL_MANIFEST);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs: string[] };
  return manifest.slugs.filter((s) => s.includes('calculo-de-administracao-de-medicamentos-e-infusoes'));
}

function main(): void {
  const lote = parseArg('lote') ?? 'calculo-de-administracao-de-medicamentos-e-infusoes-completo';
  const dir = loteQuestionsDir(lote);
  const slugs = loadSlugs();
  const rows: Row[] = [];
  const branchCounts: Record<string, number> = {};
  let missing = 0;

  for (const slug of slugs) {
    const path = join(dir, `${slug}.json`);
    if (!existsSync(path)) {
      missing += 1;
      continue;
    }
    const q = JSON.parse(readFileSync(path, 'utf8')) as {
      meta?: { subtopico?: string };
      question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
    };
    const family = classifyFamily(
      q.question_data.instruction,
      q.meta?.subtopico ?? SUBTOPICO,
      q.question_data.options,
      q.question_data.text_fragment ?? '',
    );
    const branch = inferPedagogicalBranch(
      q.meta?.subtopico ?? SUBTOPICO,
      q.question_data.instruction,
      [],
      family,
    );
    branchCounts[branch] = (branchCounts[branch] ?? 0) + 1;
    rows.push({
      slug,
      family,
      pedagogical_branch: branch,
      l3_decision: L3_DECISIONS[branch] ?? 'ok_generico',
      is_strong_branch: false,
      instruction_preview: q.question_data.instruction.slice(0, 120),
    });
  }

  const total = slugs.length;
  const threshold = STRONG_THRESHOLD(total);
  const strongBranches = Object.entries(branchCounts)
    .filter(([, n]) => n >= threshold)
    .map(([b]) => b);

  for (const row of rows) {
    row.is_strong_branch = strongBranches.includes(row.pedagogical_branch);
  }

  const branchSummaries = Object.entries(branchCounts)
    .map(([branch, count]) => ({
      branch,
      count,
      pct: Math.round((count / (rows.length || 1)) * 1000) / 10,
      is_strong: strongBranches.includes(branch),
      l3_decision: L3_DECISIONS[branch] ?? 'ok_generico',
      mold_package:
        branch === 'calc_dose_equivalencia'
          ? 'dose-equivalence-rail · soft-lens-board · dose-calc-tap · dose-trap'
          : 'morphological · reference_table · horizontal · compare',
    }))
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total_slugs_manifest: total,
    analyzed: rows.length,
    missing_json: missing,
    strong_branch_threshold: threshold,
    strong_branches: strongBranches,
    branch_summaries: branchSummaries,
    family_counts: rows.reduce(
      (acc, r) => {
        acc[r.family] = (acc[r.family] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    rows,
  };

  const outPath = resolve(
    process.cwd(),
    'artifacts/calculo-de-administracao-de-medicamentos-e-infusoes-topic-cluster-report.json',
  );
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[cluster:calculo] analyzed=${rows.length} missing=${missing} strong=${strongBranches.join(',')}`);
  console.log(`[cluster:calculo] report=${outPath}`);
}

main();
