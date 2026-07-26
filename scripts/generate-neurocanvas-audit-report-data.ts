#!/usr/bin/env tsx
/**
 * Gera dados auxiliares para artifacts/neurocanvas-audit-report.md
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';
import { iterateCanonicalQuestions, readQuestionJsonFile } from '@/lib/neurocanvas/canonicalCatalog';

type ResolverRow = {
  slug: string;
  slide_index: number;
  slide_type: string;
  layout_variant: string;
  decision: string;
  mold_fallback: boolean;
  bespoke_slots_insufficient: boolean;
  subtopic_design_variant?: string;
};

function walkQuestions(cb: (slug: string, path: string) => void) {
  iterateCanonicalQuestions(cb);
}

function main() {
  const resolver = JSON.parse(
    readFileSync(resolve('artifacts/neurocanvas-resolver-audit-catalog-full.json'), 'utf8'),
  ) as { rows: ResolverRow[]; summary: { by_layout_variant: Record<string, number> } };

  const rows = resolver.rows;
  const bySlug = new Map<string, ResolverRow[]>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) ?? [];
    list.push(r);
    bySlug.set(r.slug, list);
  }

  const zeroSlots = rows.filter((r) => r.decision === 'bespoke_zero_slots');
  const moldFallback = rows.filter((r) => r.mold_fallback);

  const dangerNoCorrect: { slug: string; slide_index: number; reason: string }[] = [];
  const logicNotTap: { slug: string; slide_index: number; reveal_mode?: string }[] = [];

  walkQuestions((slug, filePath) => {
    const q = readQuestionJsonFile(filePath) as {
      reverse_study_slides?: unknown[];
    };
    const slides = sortReverseStudySlides(
      (q.reverse_study_slides ?? []).map((s) => normalizeReverseStudySlide(s)),
    ) as Record<string, unknown>[];

    slides.forEach((slide, i) => {
      if (slide.type === 'danger_zone' && Array.isArray(slide.items)) {
        const withCorrect = slide.items.filter(
          (it) =>
            it &&
            typeof it === 'object' &&
            typeof (it as { correct?: unknown }).correct === 'string' &&
            String((it as { correct: string }).correct).trim().length > 0,
        ).length;
        if (slide.items.length > 0 && withCorrect === 0) {
          dangerNoCorrect.push({
            slug,
            slide_index: i,
            reason: slide.items.length === 1 ? 'single_item_sem_correct' : 'items_sem_correct',
          });
        }
      }
      if (slide.type === 'logic_flow') {
        if (slide.reveal_mode !== 'tap') {
          logicNotTap.push({
            slug,
            slide_index: i,
            reveal_mode: String(slide.reveal_mode ?? 'omitido→auto'),
          });
        }
      }
    });
  });

  const dangerSlugs = new Set(dangerNoCorrect.map((d) => d.slug));
  const logicSlugs = new Set(logicNotTap.map((l) => l.slug));
  const intersection = [...dangerSlugs].filter((s) => logicSlugs.has(s));
  const onlyDanger = [...dangerSlugs].filter((s) => !logicSlugs.has(s));
  const onlyLogic = [...logicSlugs].filter((s) => !dangerSlugs.has(s));

  type QProfile =
    | 'four_bespoke'
    | 'mixed_bespoke_family'
    | 'mixed_family_generic'
    | 'any_generic'
    | 'four_generic';

  const questionProfiles: Record<QProfile, number> = {
    four_bespoke: 0,
    mixed_bespoke_family: 0,
    mixed_family_generic: 0,
    any_generic: 0,
    four_generic: 0,
  };

  const decisionByType: Record<string, Record<string, number>> = {};

  for (const [, slideRows] of bySlug) {
    const decisions = slideRows.map((r) => r.decision);
    const hasGeneric = decisions.some((d) => d === 'generic_semantic');
    const hasFamily = decisions.some((d) => d === 'family_rotation');
    const hasBespoke = decisions.some((d) => d === 'bespoke_affinity');
    const allGeneric = decisions.every((d) => d === 'generic_semantic');
    const allBespoke = decisions.every((d) => d === 'bespoke_affinity');

    if (allBespoke) questionProfiles.four_bespoke += 1;
    else if (allGeneric) questionProfiles.four_generic += 1;
    else if (hasBespoke && hasFamily && !hasGeneric) questionProfiles.mixed_bespoke_family += 1;
    else if (hasFamily && hasGeneric) questionProfiles.mixed_family_generic += 1;
    if (hasGeneric) questionProfiles.any_generic += 1;

    for (const r of slideRows) {
      decisionByType[r.slide_type] ??= {};
      decisionByType[r.slide_type][r.decision] =
        (decisionByType[r.slide_type][r.decision] ?? 0) + 1;
    }
  }

  const layoutCounts = Object.entries(resolver.summary.by_layout_variant).sort(
    (a, b) => b[1] - a[1],
  );
  const totalSlides = rows.length;
  const uniqueVariants = layoutCounts.length;
  let acc = 0;
  const concentration: { top: number; count: number; pct: number; cumulative: number }[] = [];
  for (let i = 0; i < layoutCounts.length; i++) {
    acc += layoutCounts[i]![1];
    if ([5, 10, 20].includes(i + 1) || i === 0) {
      concentration.push({
        top: i + 1,
        count: layoutCounts[i]![1],
        pct: Math.round((layoutCounts[i]![1] / totalSlides) * 1000) / 10,
        cumulative: Math.round((acc / totalSlides) * 1000) / 10,
      });
    }
  }
  const top5acc = layoutCounts.slice(0, 5).reduce((s, [, c]) => s + c, 0);
  const top10acc = layoutCounts.slice(0, 10).reduce((s, [, c]) => s + c, 0);
  const top20acc = layoutCounts.slice(0, 20).reduce((s, [, c]) => s + c, 0);

  const readiness = { A: 0, B: 0, C: 0 };
  const readinessByType: Record<string, { A: number; B: number; C: number }> = {};

  walkQuestions((slug, filePath) => {
    const q = readQuestionJsonFile(filePath) as {
      reverse_study_slides?: unknown[];
    };
    const slides = sortReverseStudySlides(
      (q.reverse_study_slides ?? []).map((s) => normalizeReverseStudySlide(s)),
    ) as Record<string, unknown>[];

    for (const slide of slides) {
      const t = String(slide.type ?? 'unknown');
      readinessByType[t] ??= { A: 0, B: 0, C: 0 };
      let grade: 'A' | 'B' | 'C' = 'C';
      if (t === 'concept_map' && Array.isArray(slide.items) && slide.items.length >= 2) {
        grade = slide.items.length >= 3 ? 'A' : 'B';
      } else if (t === 'logic_flow' && Array.isArray(slide.steps) && slide.steps.length >= 4) {
        grade = slide.reveal_mode === 'tap' ? 'A' : 'B';
      } else if (t === 'golden_rule') {
        if (Array.isArray(slide.rows) && slide.rows.length >= 2) grade = 'A';
        else if (typeof slide.content === 'string' && slide.content.trim().length > 0) grade = 'C';
        else grade = 'B';
      } else if (t === 'danger_zone') {
        const items = Array.isArray(slide.items) ? slide.items : [];
        const withCorrect = items.filter(
          (it) =>
            it &&
            typeof it === 'object' &&
            typeof (it as { correct?: unknown }).correct === 'string' &&
            String((it as { correct: string }).correct).trim().length > 0,
        ).length;
        if (withCorrect >= 2) grade = 'A';
        else if (items.length > 0) grade = 'B';
        else grade = 'C';
      }
      readiness[grade] += 1;
      readinessByType[t][grade] += 1;
    }
  });

  const out = {
    generated_at: new Date().toISOString(),
    bespoke_zero_slots: zeroSlots,
    mold_fallback_rows: moldFallback,
    danger_no_correct: dangerNoCorrect,
    logic_not_tap: logicNotTap,
    correlation: {
      danger_count: dangerNoCorrect.length,
      logic_not_tap_count: logicNotTap.length,
      same_slug_intersection: intersection.length,
      only_danger_slug_count: onlyDanger.length,
      only_logic_not_tap_slug_count: onlyLogic.length,
      intersection_slugs: intersection.slice(0, 20),
      only_danger_sample: onlyDanger.slice(0, 10),
      only_logic_sample: onlyLogic.slice(0, 10),
    },
    question_profiles: questionProfiles,
    decision_by_type: decisionByType,
    layout: {
      unique_variants: uniqueVariants,
      top5_cumulative_pct: Math.round((top5acc / totalSlides) * 1000) / 10,
      top10_cumulative_pct: Math.round((top10acc / totalSlides) * 1000) / 10,
      top20_cumulative_pct: Math.round((top20acc / totalSlides) * 1000) / 10,
      top25: layoutCounts.slice(0, 25).map(([variant, count]) => ({
        variant,
        count,
        pct: Math.round((count / totalSlides) * 1000) / 10,
      })),
      rare_count_le_5: layoutCounts.filter(([, c]) => c <= 5).length,
    },
    readiness,
    readiness_by_type: readinessByType,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(
    resolve('artifacts/neurocanvas-audit-report-data.json'),
    JSON.stringify(out, null, 2),
    'utf8',
  );
  console.log(JSON.stringify({
    zeroSlots: zeroSlots.length,
    moldFallback: moldFallback.length,
    dangerNoCorrect: dangerNoCorrect.length,
    logicNotTap: logicNotTap.length,
    intersection: intersection.length,
    questionProfiles,
    uniqueVariants,
    top5: out.layout.top5_cumulative_pct,
  }, null, 2));
}

main();
