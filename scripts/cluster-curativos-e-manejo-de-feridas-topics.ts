#!/usr/bin/env tsx
/**
 * Clusteriza questões de Curativos e Manejo de Feridas por ramo pedagógico.
 * Uso: npm run cluster:curativos-e-manejo-de-feridas
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

const SUBTOPICO = 'Curativos e Manejo de Feridas';
const LOTE_DIR = resolve('data/catalog-migration/curativos-e-manejo-de-feridas-completo/questions');
const OUT = resolve('artifacts/curativos-topic-cluster-report.json');

type Row = {
  modulo_slug: string;
  family: FamilyId;
  pedagogical_branch: string;
  instruction_preview: string;
};

function main() {
  const files = readdirSync(LOTE_DIR).filter((f) => f.endsWith('.json'));
  const rows: Row[] = [];

  for (const f of files) {
    const q = JSON.parse(readFileSync(resolve(LOTE_DIR, f), 'utf8')) as {
      question_data?: {
        instruction?: string;
        text_fragment?: string;
        options?: { id: string; text: string; is_correct: boolean }[];
      };
    };
    const slug = f.replace(/\.json$/, '');
    const inst = q.question_data?.instruction ?? '';
    const opts = q.question_data?.options ?? [];
    const textFragment = q.question_data?.text_fragment ?? '';
    const corpus = `${inst} ${opts.map((o) => o.text).join(' ')}`;
    const family = classifyFamily(inst, SUBTOPICO, opts, textFragment);
    const branch = inferPedagogicalBranch(SUBTOPICO, corpus, [], family) ?? 'curativos_generico';
    rows.push({
      modulo_slug: slug,
      family,
      pedagogical_branch: branch,
      instruction_preview: inst.slice(0, 160).replace(/\s+/g, ' '),
    });
  }

  const byBranch: Record<string, { count: number; slugs: string[] }> = {};
  for (const r of rows) {
    if (!byBranch[r.pedagogical_branch]) byBranch[r.pedagogical_branch] = { count: 0, slugs: [] };
    byBranch[r.pedagogical_branch].count++;
    byBranch[r.pedagogical_branch].slugs.push(r.modulo_slug);
  }

  const clusters = Object.entries(byBranch)
    .map(([branch, data]) => ({
      branch,
      count: data.count,
      pct: Math.round((data.count / rows.length) * 1000) / 10,
      sample_slugs: data.slugs.slice(0, 5),
      all_slugs: data.slugs,
    }))
    .sort((a, b) => b.count - a.count);

  const cobertura = byBranch.curativos_cobertura_selecao?.slugs ?? [];
  const g01Slugs = cobertura.slice(0, 8);

  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        subtopico: SUBTOPICO,
        total: rows.length,
        generated_at: new Date().toISOString(),
        clusters,
        g01_curativos_cobertura_selecao: g01Slugs,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`[cluster:curativos] total=${rows.length} report=${OUT}`);
  for (const c of clusters) {
    console.log(`  ${c.count} (${c.pct}%) ${c.branch}`);
  }
  console.log(`[cluster:curativos] g01 (first 8 cobertura):`);
  for (const s of g01Slugs) console.log(`  - ${s}`);
}

main();
