#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

const manifest = JSON.parse(
  readFileSync('data/catalog-migration/curativos-e-manejo-de-feridas-completo/manifest.json', 'utf8'),
) as { slugs: string[] };
const dir = 'data/catalog-migration/curativos-e-manejo-de-feridas-completo/questions';

const rows = manifest.slugs.map((slug) => {
  const q = JSON.parse(readFileSync(join(dir, `${slug}.json`), 'utf8')) as {
    question_data?: { instruction?: string; options?: { text: string }[] };
  };
  const inst = q.question_data?.instruction ?? '';
  const options = q.question_data?.options ?? [];
  const subtopico = 'Curativos e Manejo de Feridas';
  const family = classifyFamily(inst, subtopico, options, '');
  const branch =
    inferPedagogicalBranch(subtopico, inst, [], family) ?? 'curativos_generico';
  return { slug, branch, family };
});

const byBranch: Record<string, string[]> = {};
for (const r of rows) {
  (byBranch[r.branch] ??= []).push(r.slug);
}

const order = [
  'curativos_cobertura_selecao',
  'curativos_ferida_cirurgica',
  'curativos_lpp',
  'curativos_tecnica_assepsia',
  'curativos_desbridamento',
  'curativos_exceto_incorreta',
  'curativos_estomia',
  'curativos_bandagem_imobilizacao',
  'curativos_dreno',
  'curativos_termoterapia',
  'curativos_generico',
];

const sorted: string[] = [];
for (const b of order) sorted.push(...(byBranch[b] ?? []));
for (const r of rows) if (!sorted.includes(r.slug)) sorted.push(r.slug);

console.log('Branch counts:');
for (const b of order) console.log(`  ${b}: ${(byBranch[b] ?? []).length}`);

const lotes: Record<string, string[]> = {};
for (let i = 0; i < sorted.length; i += 8) {
  const n = Math.floor(i / 8) + 1;
  const lote = `curativos-e-manejo-de-feridas-g${String(n).padStart(2, '0')}`;
  lotes[lote] = sorted.slice(i, i + 8);
}

console.log('\nLote plan:');
for (const [lote, slugs] of Object.entries(lotes)) {
  const branches = slugs.map((s) => rows.find((r) => r.slug === s)!.branch);
  const mix = [...new Set(branches)].join('+');
  console.log(`  ${lote}: ${slugs.length} — ${mix}`);
}

writeFileSync(
  'artifacts/curativos-lote-plan.json',
  JSON.stringify({ rows, byBranch, sorted, lotes }, null, 2),
);

// Also write g01-excluded plan for orchestrator (skip slugs reserved for g01)
const G01_MANIFEST = 'data/catalog-migration/curativos-e-manejo-de-feridas-g01/manifest.json';
let g01Slugs: string[] = [];
try {
  const g01 = JSON.parse(readFileSync(G01_MANIFEST, 'utf8')) as { slugs?: string[] };
  g01Slugs = g01.slugs ?? [];
} catch {
  g01Slugs = [];
}

const remaining = sorted.filter((s) => !g01Slugs.includes(s));
const lotesFromG02: Record<string, string[]> = {};
for (let i = 0; i < remaining.length; i += 8) {
  const n = Math.floor(i / 8) + 2; // start at g02
  const lote = `curativos-e-manejo-de-feridas-g${String(n).padStart(2, '0')}`;
  lotesFromG02[lote] = remaining.slice(i, i + 8);
}

writeFileSync(
  'artifacts/curativos-lote-plan-g02plus.json',
  JSON.stringify({ g01_reserved: g01Slugs, remaining_count: remaining.length, lotes: lotesFromG02 }, null, 2),
);
console.log(`\nG01 reserved: ${g01Slugs.length} slugs`);
console.log(`Remaining for g02+: ${remaining.length} slugs → ${Object.keys(lotesFromG02).length} lotes`);
console.log('Wrote artifacts/curativos-lote-plan-g02plus.json');
