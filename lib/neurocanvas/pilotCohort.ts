import type { CanonicalCatalogResult } from '@/lib/neurocanvas/canonicalCatalog';
import { readQuestionJsonFile } from '@/lib/neurocanvas/canonicalCatalog';
import { stableSlideHash } from '@/lib/neurocanvas/duplicateAnalysis';
import {
  gradeSlideReadiness,
  isContentOnlyAmbiguous,
  isLegacyExceptionSlide,
  slideShapeKey,
  textDensity,
  type ReadinessGrade,
} from '@/lib/neurocanvas/readiness';
import type { ResolverDecisionKind, SlideResolverRow } from '@/lib/neurocanvas/resolverAudit';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

export type PilotCohortEntry = {
  role: 'pilot' | 'control';
  slug: string;
  slide_index: number;
  type: string;
  subtopico?: string;
  shape: string;
  layout_variant: string;
  decision: ResolverDecisionKind;
  readiness: ReadinessGrade;
  selection_reason: string;
  risks: string[];
  stable_hash: string;
  paired_with?: string;
};

export type PilotCohortReport = {
  generated_at: string;
  pilot_count: number;
  control_count: number;
  entries: PilotCohortEntry[];
  selection_criteria: string[];
  exclusions: Record<string, number>;
  limitations: string[];
};

type BuildPilotOptions = {
  catalog: CanonicalCatalogResult;
  resolverRows: SlideResolverRow[];
  minPilot?: number;
  maxPilot?: number;
};

function slotSizeBucket(shape: string, density: number): 'small' | 'medium' | 'large' {
  if (shape === 'empty' || density < 120) return 'small';
  if (density < 400) return 'medium';
  return 'large';
}

export function buildPilotCohortReport(options: BuildPilotOptions): PilotCohortReport {
  const minPilot = options.minPilot ?? 40;
  const maxPilot = options.maxPilot ?? 80;
  const exclusions = {
    not_canonical: 0,
    legacy_exception: 0,
    content_only_ambiguous: 0,
    not_generic: 0,
    not_readiness_a: 0,
    divergent_slug: 0,
  };

  const divergent = new Set([
    ...options.catalog.unresolved_slugs,
    ...options.catalog.content_divergent_slugs,
  ]);
  const bySlug = new Map<string, SlideResolverRow[]>();
  for (const row of options.resolverRows) {
    const list = bySlug.get(row.slug) ?? [];
    list.push(row);
    bySlug.set(row.slug, list);
  }

  type Candidate = PilotCohortEntry & {
    slot_bucket: 'small' | 'medium' | 'large';
    has_rows: boolean;
    has_correct: boolean;
    tap: boolean;
    long_text: boolean;
  };

  const candidates: Candidate[] = [];

  for (const [slug, sel] of options.catalog.selections) {
    const path = sel.path;
    if (divergent.has(slug)) {
      exclusions.divergent_slug += 4;
      continue;
    }

    let question: {
      reverse_study_slides?: unknown[];
    };
    try {
      question = readQuestionJsonFile(path) as {
        reverse_study_slides?: unknown[];
      };
    } catch {
      exclusions.not_canonical += 1;
      continue;
    }

    const slides = sortReverseStudySlides(
      (question.reverse_study_slides ?? []).map((s) => normalizeReverseStudySlide(s)) as {
        type?: string;
      }[],
    ) as Record<string, unknown>[];

    const rows = bySlug.get(slug) ?? [];
    for (const row of rows) {
      const slide = slides[row.slide_index];
      if (!slide) continue;

      if (row.decision !== 'generic_semantic') {
        exclusions.not_generic += 1;
        continue;
      }
      if (isLegacyExceptionSlide(slide)) {
        exclusions.legacy_exception += 1;
        continue;
      }
      if (isContentOnlyAmbiguous(slide)) {
        exclusions.content_only_ambiguous += 1;
        continue;
      }

      const readiness = gradeSlideReadiness(slide);
      if (readiness !== 'A') {
        exclusions.not_readiness_a += 1;
        continue;
      }

      const shape = slideShapeKey(slide);
      const density = textDensity(slide);
      const hasCorrect =
        slide.type === 'danger_zone' &&
        Array.isArray(slide.items) &&
        slide.items.some(
          (it) =>
            it &&
            typeof it === 'object' &&
            typeof (it as { correct?: unknown }).correct === 'string' &&
            String((it as { correct: string }).correct).trim().length > 0,
        );

      candidates.push({
        role: 'pilot',
        slug,
        slide_index: row.slide_index,
        type: row.slide_type,
        subtopico: row.subtopico,
        shape,
        layout_variant: row.layout_variant,
        decision: row.decision,
        readiness,
        selection_reason: 'generic_readiness_A',
        risks: density > 800 ? ['texto_longo_mobile'] : [],
        stable_hash: stableSlideHash(slug, row.slide_index, row.slide_type),
        slot_bucket: slotSizeBucket(shape, density),
        has_rows: shape.includes('rows'),
        has_correct: Boolean(hasCorrect),
        tap: slide.type === 'logic_flow' && slide.reveal_mode === 'tap',
        long_text: density > 800,
      });
    }
  }

  const types = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;
  const perTypeTarget = Math.ceil(maxPilot / types.length);
  const selected: Candidate[] = [];
  const used = new Set<string>();

  const pick = (pool: Candidate[], reason: string, limit: number) => {
    for (const c of pool) {
      if (selected.length >= maxPilot) break;
      const key = `${c.slug}:${c.slide_index}`;
      if (used.has(key)) continue;
      used.add(key);
      selected.push({ ...c, selection_reason: reason });
      if (selected.filter((s) => s.type === c.type).length >= perTypeTarget) break;
    }
  };

  for (const type of types) {
    const pool = candidates
      .filter((c) => c.type === type)
      .sort((a, b) => a.slug.localeCompare(b.slug));
    pick(pool.filter((c) => c.has_rows), `${type}_rows`, perTypeTarget);
    pick(pool.filter((c) => c.has_correct), `${type}_correct_pairs`, perTypeTarget);
    pick(pool.filter((c) => c.tap), `${type}_logic_tap`, perTypeTarget);
    pick(pool.filter((c) => c.long_text), `${type}_long_text`, perTypeTarget);
    pick(pool.filter((c) => c.slot_bucket === 'small'), `${type}_slot_small`, perTypeTarget);
    pick(pool.filter((c) => c.slot_bucket === 'medium'), `${type}_slot_medium`, perTypeTarget);
    pick(pool.filter((c) => c.slot_bucket === 'large'), `${type}_slot_large`, perTypeTarget);
    pick(pool, `${type}_fill`, perTypeTarget);
  }

  while (selected.length < minPilot) {
    const next = candidates.find((c) => !used.has(`${c.slug}:${c.slide_index}`));
    if (!next) break;
    used.add(`${next.slug}:${next.slide_index}`);
    selected.push(next);
  }

  const subtopicCounts = new Map<string, number>();
  const balanced: Candidate[] = [];
  for (const c of selected.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const sub = c.subtopico ?? '(sem subtopico)';
    const count = subtopicCounts.get(sub) ?? 0;
    if (count >= 4 && balanced.length >= minPilot) continue;
    balanced.push(c);
    subtopicCounts.set(sub, count + 1);
  }
  const pilots = balanced.slice(0, maxPilot);

  const controls: PilotCohortEntry[] = [];
  for (const pilot of pilots) {
    const siblings = (bySlug.get(pilot.slug) ?? []).filter(
      (r) => r.slide_index !== pilot.slide_index && r.decision !== 'generic_semantic',
    );
    const control = siblings[0];
    if (!control) continue;
    controls.push({
      role: 'control',
      slug: control.slug,
      slide_index: control.slide_index,
      type: control.slide_type,
      subtopico: control.subtopico,
      shape: 'n/a',
      layout_variant: control.layout_variant,
      decision: control.decision,
      readiness: 'B',
      selection_reason: 'sibling_non_generic_control',
      risks: [],
      stable_hash: stableSlideHash(control.slug, control.slide_index, control.slide_type),
      paired_with: pilot.stable_hash,
    });
  }

  const entries: PilotCohortEntry[] = [
    ...pilots.map(({ slot_bucket: _s, has_rows: _r, has_correct: _c, tap: _t, long_text: _l, ...rest }) => rest),
    ...controls,
  ];

  return {
    generated_at: new Date().toISOString(),
    pilot_count: pilots.length,
    control_count: controls.length,
    entries,
    selection_criteria: [
      'decision === generic_semantic',
      'readiness === A',
      'exclui 66 legacy (danger sem correct + logic_flow sem tap)',
      'exclui content-only ambíguo',
      'exclui slugs divergentes',
      'balanceamento por type, subtopico, slot size, rows, correct, tap, texto longo',
    ],
    exclusions,
    limitations: [
      'Controle = slide não-genérico do mesmo slug quando disponível.',
      'Mobile não simulado — risco inferido por text_density > 800.',
    ],
  };
}

export function renderPilotCohortMarkdown(report: PilotCohortReport): string {
  const pilots = report.entries.filter((e) => e.role === 'pilot');
  const byType = pilots.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});

  return [
    '# NeuroCanvas — coorte piloto (Fase 0)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    `Pilotos: **${report.pilot_count}** · Controles: **${report.control_count}**`,
    '',
    '## Distribuição por tipo (pilotos)',
    '',
    ...Object.entries(byType).map(([t, n]) => `- ${t}: ${n}`),
    '',
    '## Exclusões',
    '',
    ...Object.entries(report.exclusions).map(([k, v]) => `- ${k}: ${v}`),
    '',
    '## Critérios',
    '',
    ...report.selection_criteria.map((c) => `- ${c}`),
    '',
    '## Amostra (10 primeiros pilotos)',
    '',
    '| slug | idx | type | subtopico | shape | layout |',
    '|------|----:|------|-----------|-------|--------|',
    ...pilots
      .slice(0, 10)
      .map(
        (p) =>
          `| ${p.slug} | ${p.slide_index} | ${p.type} | ${p.subtopico ?? '—'} | ${p.shape} | ${p.layout_variant} |`,
      ),
    '',
    '## Limitações',
    '',
    ...report.limitations.map((l) => `- ${l}`),
    '',
  ].join('\n');
}
