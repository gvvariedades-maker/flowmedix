import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildCanonicalCatalog } from '@/lib/neurocanvas/canonicalCatalog';
import { gradeSlideReadiness } from '@/lib/neurocanvas/readiness';
import { buildResolverAuditReport } from '@/lib/neurocanvas/resolverAudit';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

export type BaselineImpactReport = {
  generated_at: string;
  canonical_slugs: number;
  blocked_slugs: number;
  total_disk_slugs: number;
  note: string;
  resolver_current: {
    questions: number;
    slides: number;
    bespoke: number;
    family: number;
    generic: number;
    bespoke_pct: number;
    family_pct: number;
    generic_pct: number;
    mold_fallback: number;
    bespoke_zero_slots: number;
    by_type: Record<string, { bespoke: number; family: number; generic: number }>;
    top_layout_variants: { variant: string; count: number; pct: number }[];
    readiness: { A: number; B: number; C: number };
    exceptions: { danger_no_correct: number; logic_not_tap: number };
  };
  resolver_previous_fs_first: {
    source: string;
    questions: number;
    slides: number;
    bespoke: number;
    family: number;
    generic: number;
    bespoke_pct: number;
    family_pct: number;
    generic_pct: number;
  } | null;
  delta_vs_previous: {
    questions_abs: number;
    slides_abs: number;
    bespoke_pct_pts: number;
    family_pct_pts: number;
    generic_pct_pts: number;
  } | null;
  pilot_cohort: {
    pilot_count: number;
    control_count: number;
    representative: boolean;
    note: string;
  };
};

function pct(n: number, total: number): number {
  return Math.round((n / (total || 1)) * 1000) / 10;
}

export function buildBaselineImpactReport(): BaselineImpactReport {
  const catalog = buildCanonicalCatalog();
  const resolver = buildResolverAuditReport({ mode: 'catalog', canonical: true });
  const total = resolver.summary.slides_resolved || 1;
  const s = resolver.summary;

  const byType: Record<string, { bespoke: number; family: number; generic: number }> = {};
  const readiness = { A: 0, B: 0, C: 0 };
  let dangerNoCorrect = 0;
  let logicNotTap = 0;

  const rowsBySlug = new Map<string, typeof resolver.rows>();
  for (const r of resolver.rows) {
    const list = rowsBySlug.get(r.slug) ?? [];
    list.push(r);
    rowsBySlug.set(r.slug, list);
  }

  for (const [slug, sel] of catalog.selections) {
    const path = sel.path;
    if (!existsSync(path)) continue;
    let raw: { reverse_study_slides?: unknown[] };
    try {
      raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as typeof raw;
    } catch {
      continue;
    }
    const slides = sortReverseStudySlides(
      (raw.reverse_study_slides ?? []).map((x) => normalizeReverseStudySlide(x)) as { type?: string }[],
    ) as Record<string, unknown>[];
    slides.forEach((slide, i) => {
      readiness[gradeSlideReadiness(slide)] += 1;
      if (slide.type === 'danger_zone' && Array.isArray(slide.items)) {
        const wc = slide.items.filter(
          (it) =>
            it &&
            typeof it === 'object' &&
            typeof (it as { correct?: unknown }).correct === 'string' &&
            String((it as { correct: string }).correct).trim().length > 0,
        ).length;
        if (slide.items.length > 0 && wc === 0) dangerNoCorrect += 1;
      }
      if (slide.type === 'logic_flow' && slide.reveal_mode !== 'tap') logicNotTap += 1;
    });
    const resRows = rowsBySlug.get(slug) ?? [];
    for (const r of resRows) {
      byType[r.slide_type] ??= { bespoke: 0, family: 0, generic: 0 };
      if (r.decision === 'bespoke_affinity') byType[r.slide_type]!.bespoke += 1;
      else if (r.decision === 'family_rotation') byType[r.slide_type]!.family += 1;
      else if (r.decision === 'generic_semantic') byType[r.slide_type]!.generic += 1;
    }
  }

  const topLayout = Object.entries(s.by_layout_variant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([variant, count]) => ({ variant, count, pct: pct(count, total) }));

  const prevPath = resolve('artifacts/neurocanvas-resolver-audit-catalog-full.fs-first-snapshot.json');
  let previous: BaselineImpactReport['resolver_previous_fs_first'] = null;
  if (existsSync(prevPath)) {
    const p = JSON.parse(readFileSync(prevPath, 'utf8')) as {
      questions_processed: number;
      summary: { slides_resolved: number; by_decision: Record<string, number> };
    };
    const pt = p.summary.slides_resolved || 1;
    previous = {
      source: 'artifacts snapshot fs-first',
      questions: p.questions_processed,
      slides: p.summary.slides_resolved,
      bespoke: p.summary.by_decision.bespoke_affinity ?? 0,
      family: p.summary.by_decision.family_rotation ?? 0,
      generic: p.summary.by_decision.generic_semantic ?? 0,
      bespoke_pct: pct(p.summary.by_decision.bespoke_affinity ?? 0, pt),
      family_pct: pct(p.summary.by_decision.family_rotation ?? 0, pt),
      generic_pct: pct(p.summary.by_decision.generic_semantic ?? 0, pt),
    };
  } else {
    previous = {
      source: 'relatório consolidado anterior (5.651 slugs, filesystem-first)',
      questions: 5651,
      slides: 22604,
      bespoke: 14121,
      family: 5787,
      generic: 2197,
      bespoke_pct: 62.5,
      family_pct: 25.6,
      generic_pct: 9.7,
    };
  }

  const pilotPath = resolve('artifacts/neurocanvas-pilot-cohort.json');
  const pilot = existsSync(pilotPath)
    ? (JSON.parse(readFileSync(pilotPath, 'utf8')) as { pilot_count: number; control_count: number })
    : { pilot_count: 0, control_count: 0 };

  const curBespoke = s.by_decision.bespoke_affinity;
  const curFamily = s.by_decision.family_rotation;
  const curGeneric = s.by_decision.generic_semantic;

  return {
    generated_at: new Date().toISOString(),
    canonical_slugs: catalog.selections.size,
    blocked_slugs: catalog.unresolved_slugs.length,
    total_disk_slugs: catalog.selections.size + catalog.unresolved_slugs.length + catalog.invalid_slugs.length,
    note: 'Os 4.975 canônicos NÃO são catálogo final enquanto 676 blockers existirem.',
    resolver_current: {
      questions: resolver.questions_processed,
      slides: s.slides_resolved,
      bespoke: curBespoke,
      family: curFamily,
      generic: curGeneric,
      bespoke_pct: pct(curBespoke, total),
      family_pct: pct(curFamily, total),
      generic_pct: pct(curGeneric, total),
      mold_fallback: s.mold_fallback_count,
      bespoke_zero_slots: s.bespoke_zero_slots_count,
      by_type: byType,
      top_layout_variants: topLayout,
      readiness,
      exceptions: { danger_no_correct: dangerNoCorrect, logic_not_tap: logicNotTap },
    },
    resolver_previous_fs_first: previous,
    delta_vs_previous: previous
      ? {
          questions_abs: resolver.questions_processed - previous.questions,
          slides_abs: s.slides_resolved - previous.slides,
          bespoke_pct_pts: pct(curBespoke, total) - previous.bespoke_pct,
          family_pct_pts: pct(curFamily, total) - previous.family_pct,
          generic_pct_pts: pct(curGeneric, total) - previous.generic_pct,
        }
      : null,
    pilot_cohort: {
      pilot_count: pilot.pilot_count,
      control_count: pilot.control_count,
      representative: pilot.pilot_count >= 40 && pilot.pilot_count <= 80,
      note:
        'Coorte derivada só de slugs sem divergência de duplicata; não representa os 676 blockers nem o catálogo completo.',
    },
  };
}

export function renderBaselineImpactMarkdown(report: BaselineImpactReport): string {
  const c = report.resolver_current;
  const p = report.resolver_previous_fs_first;
  const d = report.delta_vs_previous;

  return [
    '# NeuroCanvas — impacto material da baseline (blockers)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    `> ${report.note}`,
    '',
    '## Escopo',
    '',
    `| Slugs em disco | ${report.total_disk_slugs} |`,
    `| Baseline canônica resolvida | ${report.canonical_slugs} |`,
    `| Blockers (unresolved) | ${report.blocked_slugs} |`,
    '',
    '## Resolver — baseline canônica atual',
    '',
    `| Métrica | Valor | % |`,
    `|---------|------:|--:|`,
    `| Questões | ${c.questions} | — |`,
    `| Slides | ${c.slides} | 100% |`,
    `| bespoke | ${c.bespoke} | ${c.bespoke_pct}% |`,
    `| family | ${c.family} | ${c.family_pct}% |`,
    `| generic | ${c.generic} | ${c.generic_pct}% |`,
    '',
    '### Por slide.type',
    '',
    '| type | bespoke | family | generic |',
    '|------|--------:|-------:|--------:|',
    ...Object.entries(c.by_type).map(
      ([t, v]) => `| ${t} | ${v.bespoke} | ${v.family} | ${v.generic} |`,
    ),
    '',
    '### Readiness (baseline resolvida)',
    '',
    `A=${c.readiness.A} · B=${c.readiness.B} · C=${c.readiness.C}`,
    '',
    `Exceções: danger sem correct=${c.exceptions.danger_no_correct} · logic_flow sem tap=${c.exceptions.logic_not_tap}`,
    '',
    '## Comparação com baseline anterior (5.651 filesystem-first)',
    '',
    p
      ? [
          `| | Anterior | Atual (canônica parcial) | Δ |`,
          `|---|--------:|------------------------:|--:|`,
          `| Questões | ${p.questions} | ${c.questions} | ${d?.questions_abs ?? '—'} |`,
          `| Slides | ${p.slides} | ${c.slides} | ${d?.slides_abs ?? '—'} |`,
          `| bespoke % | ${p.bespoke_pct}% | ${c.bespoke_pct}% | ${d?.bespoke_pct_pts ?? '—'} p.p. |`,
          `| family % | ${p.family_pct}% | ${c.family_pct}% | ${d?.family_pct_pts ?? '—'} p.p. |`,
          `| generic % | ${p.generic_pct}% | ${c.generic_pct}% | ${d?.generic_pct_pts ?? '—'} p.p. |`,
        ].join('\n')
      : 'Baseline anterior não disponível.',
    '',
    '## Coorte piloto',
    '',
    `Pilotos: ${report.pilot_cohort.pilot_count} · Controles: ${report.pilot_cohort.control_count}`,
    '',
    report.pilot_cohort.note,
    '',
  ].join('\n');
}
