#!/usr/bin/env tsx
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

type Row = { slug: string; sampled: boolean; hasPng: boolean; examDiv: boolean; lote: string };

const rows: Row[] = [];

for (let i = 1; i <= 15; i++) {
  const lote = `puncao-venosa-e-cuidados-com-cateteres-g${String(i).padStart(2, '0')}`;
  const dir = join('data/catalog-migration', lote, 'questions');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
      modulo_slug?: string;
      meta?: {
        efficacy_contract?: { a4_reviewer?: string; sampled?: boolean; a4_human_notes?: string };
        content_review?: { exam_vs_current?: string };
      };
    };
    const ec = q.meta?.efficacy_contract;
    if (!ec || ec.a4_reviewer !== 'handcraft-qc') continue;
    const slug = q.modulo_slug ?? f.replace(/\.json$/, '');
    const cap = resolve('artifacts/questao-review', slug);
    const hasPng = existsSync(cap) && readdirSync(cap).some((n) => n.endsWith('.png'));
    const notes = String(ec.a4_human_notes ?? '');
    const examDiv =
      notes.includes('exam_vs_current') ||
      Boolean(
        q.meta?.content_review?.exam_vs_current &&
          q.meta.content_review.exam_vs_current !== 'none' &&
          notes.includes('exam_vs_current'),
      );
    rows.push({ slug, sampled: ec.sampled === true, hasPng, examDiv, lote });
  }
}

const sampled = rows.filter((r) => r.sampled);
const divBlocker = rows.filter((r) => r.examDiv);
const mustCapture = rows.filter((r) => r.sampled || r.examDiv);

const out = {
  generated_at: new Date().toISOString(),
  handcraft_qc: rows.length,
  sampled_total: sampled.length,
  sampled_with_png: sampled.filter((r) => r.hasPng).length,
  exam_divergence_blocker: divBlocker.length,
  exam_divergence_with_png: divBlocker.filter((r) => r.hasPng).length,
  must_capture_total: mustCapture.length,
  must_capture_with_png: mustCapture.filter((r) => r.hasPng).length,
  missing_must_capture: mustCapture.filter((r) => !r.hasPng),
};

const outPath = resolve('artifacts/puncao-onda2-capture-coverage.json');
mkdirSync(resolve('artifacts'), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(out, null, 2));
