#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — Processo de Enfermagem (SAE) — core runner.
 *
 *   npx tsx scripts/handcraft-processo-de-enfermagem-core.ts --lote=processo-de-enfermagem-g01
 *   npx tsx scripts/handcraft-processo-de-enfermagem-core.ts --all
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildSaeGuidelineSnapshot,
  buildSaeSourcesForSlug,
  SAE_SUBTOPICO,
} from '@/lib/catalogMigration/saePedagogy';
import { COMPLETO_LOTE, LOTE_SLUGS } from '@/scripts/sae-handcraft-config';
import { SAE_HANDCRAFT_SPECS } from '@/scripts/sae-handcraft-specs.generated';

const REVIEWED = '2026-07-15';
const COMPLETO_DIR = loteQuestionsDir(COMPLETO_LOTE);

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bdaagulha\b/gi, 'da agulha')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    instruction: qd.instruction.replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2'),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

function metaBase(q: Q, slug: string, spec: (typeof SAE_HANDCRAFT_SPECS)[keyof typeof SAE_HANDCRAFT_SPECS]) {
  const corpus = `${q.question_data.instruction} ${q.question_data.options.map((o) => o.text).join(' ')}`;
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SAE_SUBTOPICO,
    pedagogical_branch: spec.branch,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: buildSaeGuidelineSnapshot(corpus, spec.guideline),
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: buildSaeSourcesForSlug(corpus),
  };
}

function ensureLote(lote: string, slugs: string[]): void {
  const dir = loteDir(lote);
  const qDir = loteQuestionsDir(lote);
  mkdirSync(qDir, { recursive: true });
  writeFileSync(
    loteManifestPath(lote),
    `${JSON.stringify(
      {
        lote,
        exported_at: new Date().toISOString(),
        source: 'handcraft',
        parent: COMPLETO_LOTE,
        slugs,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  for (const slug of slugs) {
    const src = join(COMPLETO_DIR, `${slug}.json`);
    const dst = join(qDir, `${slug}.json`);
    if (!existsSync(src)) throw new Error(`Source missing: ${src}`);
    if (!existsSync(dst)) copyFileSync(src, dst);
  }
}

function handcraftLote(lote: string): number {
  const slugs = LOTE_SLUGS[lote];
  if (!slugs) throw new Error(`Lote desconhecido: ${lote}`);
  ensureLote(lote, slugs);
  const dir = loteQuestionsDir(lote);
  let ok = 0;
  for (const slug of slugs) {
    const spec = SAE_HANDCRAFT_SPECS[slug as keyof typeof SAE_HANDCRAFT_SPECS];
    if (!spec) throw new Error(`Spec missing: ${slug}`);
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = [
      { type: 'concept_map', ...spec.concept_map },
      { type: 'logic_flow', ...spec.logic_flow },
      { type: 'golden_rule', ...spec.golden_rule },
      { type: 'danger_zone', ...spec.danger_zone },
    ];
    const out = {
      meta: metaBase(raw, slug, spec),
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sae] OK ${slug}`);
  }
  console.log(`[handcraft:sae] lote=${lote} total=${ok}`);
  return ok;
}

function main(): void {
  const all = process.argv.includes('--all');
  const lote = parseArg('lote');
  if (all) {
    let total = 0;
    for (const l of Object.keys(LOTE_SLUGS)) total += handcraftLote(l);
    console.log(`[handcraft:sae] ALL total=${total}`);
    return;
  }
  if (!lote) throw new Error('Use --lote=processo-de-enfermagem-gNN ou --all');
  handcraftLote(lote);
}

export { handcraftLote, ensureLote };
