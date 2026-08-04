#!/usr/bin/env tsx
/**
 * Helper F2c — amostra estratificada de ~20 âncoras para calibração manual.
 * Não é gate; só lista candidatos.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';

type Row = {
  slug: string;
  path: string;
  spoiler_letter: boolean;
  spoiler_vf: boolean;
  family?: string;
  correct?: string;
  concept_preview: string;
};

const dir = resolve(process.cwd(), 'examples');
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .sort();

const rows: Row[] = [];
for (const f of files) {
  const path = join(dir, f);
  const j = JSON.parse(readFileSync(path, 'utf8')) as {
    meta?: { family?: string };
    question_data?: { options?: { id?: string; is_correct?: boolean }[] };
    reverse_study_slides?: { type?: string; items?: { label?: string; detail?: string }[]; footer_rule?: string }[];
    study_slides?: { type?: string; items?: { label?: string; detail?: string }[]; footer_rule?: string }[];
  };
  const findings = detectUnifiedPedagogy(j);
  const concept = (j.reverse_study_slides ?? j.study_slides ?? []).find((s) => s.type === 'concept_map');
  const surfaces = [
    ...(concept?.items ?? []).flatMap((i) => [i.label, i.detail].filter(Boolean) as string[]),
    ...(concept?.footer_rule ? [concept.footer_rule] : []),
  ];
  const opt = (j.question_data?.options ?? []).find((o) => o.is_correct === true);
  rows.push({
    slug: f.replace(/\.json$/, ''),
    path,
    spoiler_letter: findings.some((x) => x.code === 'pedagogy_letter_spoiler'),
    spoiler_vf: findings.some((x) => x.code === 'pedagogy_vf_verdict_spoiler'),
    family: j.meta?.family,
    correct: opt?.id,
    concept_preview: surfaces.join(' · ').slice(0, 240),
  });
}

const spoilers = rows.filter((r) => r.spoiler_letter || r.spoiler_vf);
const clean = rows.filter((r) => !r.spoiler_letter && !r.spoiler_vf);

function take(arr: Row[], n: number, seen: Set<string>): Row[] {
  const out: Row[] = [];
  for (const r of arr) {
    if (seen.has(r.slug)) continue;
    seen.add(r.slug);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

const seen = new Set<string>();
const sample: Row[] = [
  ...take(spoilers, 8, seen),
  ...take(
    clean.filter((r) => r.family === 'vf'),
    3,
    seen,
  ),
  ...take(
    clean.filter((r) => r.family === 'certo_errado' || r.family === 'conceito'),
    3,
    seen,
  ),
  ...take(
    clean.filter((r) => r.family === 'protocolo'),
    3,
    seen,
  ),
  ...take(
    clean.filter((r) => r.family === 'calc' || r.family === 'legis' || r.family === 'text_fragment'),
    3,
    seen,
  ),
];

while (sample.length < 20) {
  const next = clean.find((r) => !seen.has(r.slug)) ?? rows.find((r) => !seen.has(r.slug));
  if (!next) break;
  seen.add(next.slug);
  sample.push(next);
}

const summary = {
  total_anchors: rows.length,
  letter_spoiler: rows.filter((r) => r.spoiler_letter).length,
  vf_spoiler: rows.filter((r) => r.spoiler_vf).length,
  either_spoiler: spoilers.length,
  clean: clean.length,
  calibration_sample: sample.map((r) => ({
    slug: r.slug,
    expected_bucket: r.spoiler_letter || r.spoiler_vf ? 'regex_spoiler' : 'regex_clean',
    family: r.family ?? null,
    correct: r.correct ?? null,
    concept_preview: r.concept_preview,
  })),
};

const artifactsDir = resolve(process.cwd(), 'artifacts');
mkdirSync(artifactsDir, { recursive: true });
const out = join(artifactsDir, 'blind-reader-calibration-sample.json');
writeFileSync(out, JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify({ ...summary, calibration_sample: `${sample.length} slugs` }, null, 2));
console.log('wrote', out);
for (const s of sample) {
  console.log(`- ${s.slug} [${s.spoiler_letter || s.spoiler_vf ? 'SPOILER' : 'clean'}] ${s.family ?? '?'} → ${s.correct ?? '?'}`);
}
