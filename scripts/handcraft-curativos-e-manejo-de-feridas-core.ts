#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — Curativos e Manejo de Feridas — core runner (g02+).
 *
 *   npx tsx scripts/handcraft-curativos-e-manejo-de-feridas-core.ts --lote=curativos-e-manejo-de-feridas-g02
 *   npx tsx scripts/handcraft-curativos-e-manejo-de-feridas-core.ts --all
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildCurativosGuidelineSnapshot,
  buildCurativosSourcesForSlug,
  CURATIVOS_SUBTOPICO,
} from '@/lib/catalogMigration/curativosPedagogy';
import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';
import { COMPLETO_LOTE, LOTE_SLUGS } from '@/scripts/curativos-handcraft-config';
import { CURATIVOS_HANDCRAFT_SPECS } from '@/scripts/curativos-handcraft-specs.generated';

const REVIEWED = '2026-07-16';

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bbordasregulares\b/gi, 'bordas regulares')
    .replace(/\blocalesão\b/gi, 'local da lesão')
    .replace(/\bfavorecendo odesbridamento\b/gi, 'favorecendo o desbridamento')
    .replace(/\bdeassepsia\b/gi, 'de assepsia')
    .replace(/\bnotratamento\b/gi, 'no tratamento')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

function metaBase(
  q: Q,
  slug: string,
  spec: (typeof CURATIVOS_HANDCRAFT_SPECS)[keyof typeof CURATIVOS_HANDCRAFT_SPECS],
  slides: unknown[],
) {
  const corpus = `${q.question_data.instruction} ${q.question_data.options.map((o) => o.text).join(' ')}`;
  const family = spec.family;
  const inferred = inferPedagogicalBranch(
    CURATIVOS_SUBTOPICO,
    q.question_data.instruction,
    slides as { type?: string }[],
    family,
  );
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: CURATIVOS_SUBTOPICO,
    pedagogical_branch: inferred ?? spec.branch,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: buildCurativosGuidelineSnapshot(corpus, spec.guideline),
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: buildCurativosSourcesForSlug(corpus),
  };
}

function ensureLote(lote: string, slugs: string[]): void {
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
  const completoDir = loteQuestionsDir(COMPLETO_LOTE);
  for (const slug of slugs) {
    const src = join(completoDir, `${slug}.json`);
    const dst = join(qDir, `${slug}.json`);
    if (!existsSync(src)) throw new Error(`Source missing: ${src}`);
    if (!existsSync(dst)) copyFileSync(src, dst);
  }
}

function writeLoteMeta(lote: string, slugs: string[]): void {
  const branches = slugs.map(
    (s) => CURATIVOS_HANDCRAFT_SPECS[s as keyof typeof CURATIVOS_HANDCRAFT_SPECS]?.branch ?? 'unknown',
  );
  const mix = [...new Set(branches)];
  writeFileSync(
    join(loteDir(lote), 'lote-meta.json'),
    `${JSON.stringify(
      {
        lote,
        handcraft_at: REVIEWED,
        slug_count: slugs.length,
        branch_mix: mix,
        status: 'handcrafted',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

export function handcraftLote(lote: string): number {
  const slugs = LOTE_SLUGS[lote];
  if (!slugs) throw new Error(`Lote desconhecido: ${lote}`);
  ensureLote(lote, slugs);
  const dir = loteQuestionsDir(lote);
  let ok = 0;
  for (const slug of slugs) {
    const spec = CURATIVOS_HANDCRAFT_SPECS[slug as keyof typeof CURATIVOS_HANDCRAFT_SPECS];
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
      meta: metaBase(raw, slug, spec, slides),
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:curativos] OK ${slug}`);
  }
  writeLoteMeta(lote, slugs);
  console.log(`[handcraft:curativos] lote=${lote} total=${ok}`);
  return ok;
}

function main(): void {
  const all = process.argv.includes('--all');
  const lote = parseArg('lote');
  if (all) {
    let total = 0;
    for (const l of Object.keys(LOTE_SLUGS)) total += handcraftLote(l);
    console.log(`[handcraft:curativos] ALL total=${total}`);
    return;
  }
  if (!lote) throw new Error('Use --lote=curativos-e-manejo-de-feridas-gNN ou --all');
  handcraftLote(lote);
}

main();
