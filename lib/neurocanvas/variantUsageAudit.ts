/**
 * Auditoria de uso de layoutVariant no catálogo canônico + forma dos genéricos.
 */
import {
  enrichPresentationContext,
  resolveSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { resolveQuestionFamilyId, type FamilyId } from '@/components/slides/core/questionFamily';
import { parseLimitArg, parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  buildCanonicalCatalog,
  iterateCanonicalQuestions,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import {
  declaredVariantIds,
  GENERIC_BY_SLIDE_TYPE,
  type SlideTypeKey,
} from '@/lib/neurocanvas/declaredVariants';
import { isBespokeLayoutVariant } from '@/lib/slides/moldAffinity';
import {
  normalizeLogicFlowSteps,
  normalizeReverseStudySlide,
} from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

export type TextLengthBucket = 'short' | 'medium' | 'long' | 'xl';

export type GenericFormBuckets = {
  itemCount: Record<string, number>;
  stepCount: Record<string, number>;
  rowCount: Record<string, number>;
  hasRows: { true: number; false: number };
  hasCorrect: { true: number; false: number };
  textLength: Record<TextLengthBucket, number>;
  by_layout_variant: Record<string, number>;
};

export type VariantUsageReport = {
  generated_at: string;
  source: 'catalog_full' | 'catalog_sample';
  questions_processed: number;
  slides_resolved: number;
  by_layout_variant: Record<string, number>;
  by_slide_type: Record<string, Record<string, number>>;
  top_layout_variants: { variant: string; count: number; pct: number }[];
  declared_variants: string[];
  unused_declared: string[];
  zero_usage_candidates: string[];
  low_usage: { variant: string; count: number }[];
  generic_form_distribution: Record<SlideTypeKey, GenericFormBuckets>;
  limitations: string[];
};

type QuestionJson = {
  meta?: {
    subtopico?: string;
    pedagogical_branch?: string;
    family?: string;
  };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id: string; text: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: unknown[];
  study_slides?: unknown[];
};

function emptyFormBuckets(): GenericFormBuckets {
  return {
    itemCount: {},
    stepCount: {},
    rowCount: {},
    hasRows: { true: 0, false: 0 },
    hasCorrect: { true: 0, false: 0 },
    textLength: { short: 0, medium: 0, long: 0, xl: 0 },
    by_layout_variant: {},
  };
}

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function textLengthBucket(len: number): TextLengthBucket {
  if (len < 120) return 'short';
  if (len < 400) return 'medium';
  if (len < 900) return 'long';
  return 'xl';
}

function collectSlideText(slide: {
  content?: string;
  footer_rule?: string;
  items?: unknown[];
  steps?: unknown[];
  rows?: unknown[];
}): string {
  const parts: string[] = [];
  if (typeof slide.content === 'string') parts.push(slide.content);
  if (typeof slide.footer_rule === 'string') parts.push(slide.footer_rule);
  for (const step of normalizeLogicFlowSteps(slide.steps)) {
    parts.push(step);
  }
  if (Array.isArray(slide.items)) {
    for (const raw of slide.items) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as { label?: string; detail?: string; correct?: string };
      if (item.label) parts.push(item.label);
      if (item.detail) parts.push(item.detail);
      if (item.correct) parts.push(item.correct);
    }
  }
  if (Array.isArray(slide.rows)) {
    for (const raw of slide.rows) {
      if (!raw || typeof raw !== 'object') continue;
      const row = raw as { label?: string; value?: string };
      if (row.label) parts.push(row.label);
      if (row.value) parts.push(row.value);
    }
  }
  return parts.join('\n');
}

function itemCountKey(n: number): string {
  if (n <= 0) return '0';
  if (n <= 2) return '1-2';
  if (n === 3) return '3';
  if (n === 4) return '4';
  if (n <= 6) return '5-6';
  return '7+';
}

function stepCountKey(n: number): string {
  if (n <= 0) return '0';
  if (n <= 2) return '1-2';
  if (n <= 4) return '3-4';
  if (n <= 6) return '5-6';
  if (n <= 8) return '7-8';
  return '9+';
}

function rowCountKey(n: number): string {
  if (n <= 0) return '0';
  if (n <= 2) return '1-2';
  if (n <= 4) return '3-4';
  if (n <= 6) return '5-6';
  return '7+';
}

function isSlideTypeKey(t: string): t is SlideTypeKey {
  return t === 'concept_map' || t === 'golden_rule' || t === 'logic_flow' || t === 'danger_zone';
}

export type VariantUsageOptions = {
  limit?: number;
};

export function buildVariantUsageReport(options: VariantUsageOptions = {}): VariantUsageReport {
  const limitations: string[] = [];
  const byLayout: Record<string, number> = {};
  const bySlideType: Record<string, Record<string, number>> = {};
  const genericForm: Record<SlideTypeKey, GenericFormBuckets> = {
    concept_map: emptyFormBuckets(),
    golden_rule: emptyFormBuckets(),
    logic_flow: emptyFormBuckets(),
    danger_zone: emptyFormBuckets(),
  };

  let questionsProcessed = 0;
  let slidesResolved = 0;

  const catalog = buildCanonicalCatalog({ strict: false });
  if (catalog.blockers.length > 0) {
    limitations.push(...catalog.blockers.slice(0, 5));
  }

  const limit = options.limit;
  iterateCanonicalQuestions((slug, path) => {
    if (limit != null && questionsProcessed >= limit) return;
    questionsProcessed += 1;

    let raw: unknown;
    try {
      raw = readQuestionJsonFile(path);
    } catch (err) {
      limitations.push(`Falha ao ler ${path}: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    const question = raw as QuestionJson;
    const slidesRaw = question.reverse_study_slides ?? question.study_slides;
    if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) return;

    const meta = question.meta ?? {};
    const qd = question.question_data ?? {};
    const familyId = resolveQuestionFamilyId({
      instruction: qd.instruction,
      subtopico: meta.subtopico,
      options: (qd.options ?? []).map((o) => ({
        id: o.id,
        text: o.text,
        is_correct: o.is_correct ?? false,
      })),
      textFragment: qd.text_fragment,
      metaFamily: meta.family as FamilyId | undefined,
    });

    const sorted = sortReverseStudySlides(
      slidesRaw.map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
    ) as Array<{
      type?: string;
      layout_variant?: string;
      content?: string;
      footer_rule?: string;
      items?: unknown[];
      steps?: unknown[];
      rows?: { label: string; value: string }[];
      meta?: { subtopico?: string; pedagogical_branch?: string };
    }>;

    sorted.forEach((slide, slideIndex) => {
      const presentationContext = enrichPresentationContext(
        {
          questionSlug: slug,
          slideIndex,
          jsonLayoutVariant: slide.layout_variant,
          familyId,
        },
        slide.meta,
        qd.instruction,
        // enrichPresentationContext tipa allSlides como SlideInput[] (rows obrigatórios)
        sorted as Parameters<typeof enrichPresentationContext>[3],
        {
          subtopico: meta.subtopico,
          pedagogical_branch: meta.pedagogical_branch,
        },
      );

      const resolved = resolveSlidePresentation(
        slide as Parameters<typeof resolveSlidePresentation>[0],
        presentationContext,
      );
      const variant = resolved.layoutVariant;
      const slideType = String(slide.type ?? 'unknown');

      bump(byLayout, variant);
      if (!bySlideType[slideType]) bySlideType[slideType] = {};
      bump(bySlideType[slideType], variant);
      slidesResolved += 1;

      if (!isBespokeLayoutVariant(variant) && isSlideTypeKey(slideType)) {
        const form = genericForm[slideType];
        bump(form.by_layout_variant, variant);

        const items = Array.isArray(slide.items) ? slide.items : [];
        const steps = normalizeLogicFlowSteps(slide.steps);
        const rows = Array.isArray(slide.rows) ? slide.rows : [];
        const hasCorrect = items.some((raw) => {
          if (!raw || typeof raw !== 'object') return false;
          const c = (raw as { correct?: unknown }).correct;
          return typeof c === 'string' && c.trim().length > 0;
        });

        bump(form.itemCount, itemCountKey(items.length));
        bump(form.stepCount, stepCountKey(steps.length));
        bump(form.rowCount, rowCountKey(rows.length));
        form.hasRows[rows.length > 0 ? 'true' : 'false'] += 1;
        form.hasCorrect[hasCorrect ? 'true' : 'false'] += 1;
        form.textLength[textLengthBucket(collectSlideText(slide).length)] += 1;
      }
    });
  }, catalog);

  const total = slidesResolved || 1;
  const top = Object.entries(byLayout)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([variant, count]) => ({
      variant,
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }));

  const declared = declaredVariantIds();
  const used = new Set(Object.keys(byLayout));
  const unusedDeclared = declared.filter((id) => !used.has(id));
  const zeroUsage = unusedDeclared.filter((id) => isBespokeLayoutVariant(id));
  const lowUsage = Object.entries(byLayout)
    .filter(([, count]) => count > 0 && count < 5)
    .map(([variant, count]) => ({ variant, count }))
    .sort((a, b) => a.count - b.count || a.variant.localeCompare(b.variant));

  // Sanity: ensure all generic buckets exist even if empty
  for (const ids of Object.values(GENERIC_BY_SLIDE_TYPE)) {
    void ids;
  }

  return {
    generated_at: new Date().toISOString(),
    source: limit != null ? 'catalog_sample' : 'catalog_full',
    questions_processed: questionsProcessed,
    slides_resolved: slidesResolved,
    by_layout_variant: Object.fromEntries(
      Object.entries(byLayout).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    ),
    by_slide_type: bySlideType,
    top_layout_variants: top,
    declared_variants: declared,
    unused_declared: unusedDeclared,
    zero_usage_candidates: zeroUsage,
    low_usage: lowUsage,
    generic_form_distribution: genericForm,
    limitations,
  };
}

/** CLI helpers — parse args the same way as other audit scripts. */
export function resolveVariantUsageCliOptions(): VariantUsageOptions {
  const limitRaw = parseArg('limit');
  return {
    limit: limitRaw ? parseLimitArg(5000) : undefined,
  };
}
