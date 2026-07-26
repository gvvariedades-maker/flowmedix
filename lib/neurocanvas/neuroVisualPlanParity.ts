import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type ResolvedSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { getThemeForSlide, type ThemeColors } from '@/components/slides/core/themeGenerator';
import { resolveQuestionFamilyId, type FamilyId } from '@/components/slides/core/questionFamily';
import {
  buildCanonicalCatalog,
  iterateCanonicalQuestions,
  readQuestionJsonFile,
  type CanonicalCatalogResult,
} from '@/lib/neurocanvas/canonicalCatalog';
import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildNeuroVisualPlanV0,
  PRESENTATION_PARITY_FIELDS,
  type NeuroVisualPlanSlideInput,
  type PresentationParityField,
} from '@/lib/neurocanvas/neuroVisualPlanV0';
import { resolveAuditRoots, type NeurocanvasAuditRoots } from '@/lib/neurocanvas/auditRoots';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

export type PresentationFieldMismatch = {
  field: PresentationParityField;
  direct: unknown;
  plan: unknown;
};

export type SlideParityMismatch = {
  slug: string;
  slide_index: number;
  slide_type: string;
  presentation_mismatches: PresentationFieldMismatch[];
  theme_mismatch?: { direct: ThemeColors; plan: ThemeColors };
};

export type NeuroVisualPlanParityReport = {
  schema_version: 'neurovisual-plan-parity-v0';
  questions_processed: number;
  slides_compared: number;
  slides_equivalent: number;
  mismatches: SlideParityMismatch[];
  canonical_unresolved_slugs: number;
  limitations: string[];
};

export const DEFAULT_MAX_MISMATCH_SAMPLES = 25;

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

function comparePresentationFields(
  direct: ResolvedSlidePresentation,
  plan: ResolvedSlidePresentation,
): PresentationFieldMismatch[] {
  const mismatches: PresentationFieldMismatch[] = [];
  for (const field of PRESENTATION_PARITY_FIELDS) {
    const directValue = direct[field];
    const planValue = plan[field];
    if (canonicalJson(directValue) !== canonicalJson(planValue)) {
      mismatches.push({ field, direct: directValue, plan: planValue });
    }
  }
  return mismatches;
}

function compareThemes(direct: ThemeColors, plan: ThemeColors): boolean {
  return canonicalJson(direct) === canonicalJson(plan);
}

export type ResolveSlideParityInput = {
  slide: NeuroVisualPlanSlideInput;
  slug: string;
  slideIndex: number;
  familyId?: FamilyId;
  instruction?: string;
  allSlides: NeuroVisualPlanSlideInput[];
  questionMeta?: { subtopico?: string; pedagogical_branch?: string };
};

/** Compara caminho direto (resolveSlidePresentation) × encapsulado (NeuroVisualPlan v0). */
export function compareSlideVisualParity(input: ResolveSlideParityInput): SlideParityMismatch | null {
  const presentationContext = enrichPresentationContext(
    {
      questionSlug: input.slug,
      slideIndex: input.slideIndex,
      jsonLayoutVariant: input.slide.layout_variant,
      familyId: input.familyId,
    },
    input.slide.meta,
    input.instruction,
    input.allSlides,
    input.questionMeta,
  );

  const directPresentation = resolveSlidePresentation(input.slide, presentationContext);
  const plan = buildNeuroVisualPlanV0({
    slide: input.slide,
    questionHash: input.slug,
    questionSlug: input.slug,
    slideIndex: input.slideIndex,
    jsonLayoutVariant: input.slide.layout_variant,
    familyId: input.familyId,
    questionInstruction: input.instruction,
    questionSlides: input.allSlides,
    questionMeta: input.questionMeta,
    includeTheme: true,
  });

  const presentationMismatches = comparePresentationFields(directPresentation, plan.presentation);

  const directTheme = getThemeForSlide(input.slide, input.slug, input.slideIndex);
  const themeMismatch =
    plan.theme && !compareThemes(directTheme, plan.theme)
      ? { direct: directTheme, plan: plan.theme }
      : undefined;

  if (presentationMismatches.length === 0 && !themeMismatch) {
    return null;
  }

  return {
    slug: input.slug,
    slide_index: input.slideIndex,
    slide_type: String(input.slide.type ?? 'unknown'),
    presentation_mismatches: presentationMismatches,
    theme_mismatch: themeMismatch,
  };
}

function resolveQuestionSlideParities(
  question: QuestionJson,
  slug: string,
): SlideParityMismatch[] {
  const slidesRaw = question.reverse_study_slides ?? question.study_slides;
  if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) return [];

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
  ) as NeuroVisualPlanSlideInput[];

  const mismatches: SlideParityMismatch[] = [];

  sorted.forEach((slide, slideIndex) => {
    const mismatch = compareSlideVisualParity({
      slide,
      slug,
      slideIndex,
      familyId,
      instruction: qd.instruction,
      allSlides: sorted,
      questionMeta: {
        subtopico: meta.subtopico,
        pedagogical_branch: meta.pedagogical_branch,
      },
    });
    if (mismatch) {
      mismatches.push(mismatch);
    }
  });

  return mismatches;
}

export type BuildNeuroVisualPlanParityOptions = {
  maxMismatchSamples?: number;
  strict?: boolean;
} & Partial<NeurocanvasAuditRoots>;

export function buildNeuroVisualPlanParityReport(
  options: BuildNeuroVisualPlanParityOptions = {},
): NeuroVisualPlanParityReport {
  const { catalogRoot, repoRoot } = resolveAuditRoots(options);
  const maxSamples = options.maxMismatchSamples ?? DEFAULT_MAX_MISMATCH_SAMPLES;
  const limitations: string[] = [];
  const mismatches: SlideParityMismatch[] = [];
  let questionsProcessed = 0;
  let slidesCompared = 0;

  const catalog: CanonicalCatalogResult = buildCanonicalCatalog({
    strict: options.strict,
    catalogRoot,
    repoRoot,
  });

  let totalMismatchCount = 0;

  iterateCanonicalQuestions((slug, filePath) => {
    let question: QuestionJson;
    try {
      question = readQuestionJsonFile(filePath) as QuestionJson;
    } catch {
      limitations.push(`JSON inválido: ${filePath}`);
      return;
    }

    const slidesRaw = question.reverse_study_slides ?? question.study_slides;
    const slideCount = Array.isArray(slidesRaw) ? slidesRaw.length : 0;
    slidesCompared += slideCount;
    questionsProcessed += 1;

    const slideMismatches = resolveQuestionSlideParities(question, slug);
    totalMismatchCount += slideMismatches.length;
    for (const m of slideMismatches) {
      if (mismatches.length < maxSamples) {
        mismatches.push(m);
      }
    }
  }, catalog);

  return {
    schema_version: 'neurovisual-plan-parity-v0',
    questions_processed: questionsProcessed,
    slides_compared: slidesCompared,
    slides_equivalent: slidesCompared - totalMismatchCount,
    mismatches,
    canonical_unresolved_slugs: catalog.unresolved_slugs.length,
    limitations:
      totalMismatchCount > maxSamples
        ? [
            ...limitations,
            `Amostra limitada a ${maxSamples} divergências (total: ${totalMismatchCount}).`,
          ]
        : limitations,
  };
}
