import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type ResolvedSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { getThemeForSlide, type ThemeColors } from '@/components/slides/core/themeGenerator';
import { resolveQuestionFamilyId, type FamilyId } from '@/components/slides/core/questionFamily';
import {
  resolveDangerZoneItemPolarities,
  type DangerZoneItemLike,
  type DangerZoneItemPolarity,
  type DangerZoneOptionLike,
} from '@/components/slides/core/dangerZonePolarity';
import {
  buildCanonicalCatalog,
  iterateCanonicalQuestions,
  readQuestionJsonFile,
  type CanonicalCatalogResult,
} from '@/lib/neurocanvas/canonicalCatalog';
import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildNeuroVisualPlanV0,
  type NeuroVisualPlanSlideInput,
} from '@/lib/neurocanvas/neuroVisualPlanV0';
import { resolveAuditRoots, type NeurocanvasAuditRoots } from '@/lib/neurocanvas/auditRoots';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';

export type PresentationFieldMismatch = {
  field: string;
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

/**
 * Dimensão F1 — polaridade fora de `ResolvedSlidePresentation`.
 * Contagem intencional: slides cujo chrome deixa de ser “tudo ERRO”.
 * Não falha o gate de paridade de presentation/theme.
 */
export type IntentionalPolarityParity = {
  danger_zone_slides: number;
  slides_with_valid_conduct: number;
  valid_conduct_items: number;
  /** Slides em que polaridade do plano ≠ derivação direta (bug real). */
  polarity_path_mismatches: number;
  note: string;
};

export type NeuroVisualPlanParityReport = {
  schema_version: 'neurovisual-plan-parity-v0';
  questions_processed: number;
  slides_compared: number;
  slides_equivalent: number;
  mismatches: SlideParityMismatch[];
  intentional_polarity: IntentionalPolarityParity;
  canonical_unresolved_slugs: number;
  limitations: string[];
};

export const DEFAULT_MAX_MISMATCH_SAMPLES = 25;

export const INTENTIONAL_POLARITY_NOTE =
  'F1: dangerItemPolarities vive fora de presentation — chrome trap×valid_conduct é divergência intencional do histórico “tudo ERRO”; presentation+theme continuam o gate rígido.';

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

function presentationFieldKeys(
  direct: ResolvedSlidePresentation,
  plan: ResolvedSlidePresentation,
): string[] {
  const keys = new Set<string>();
  for (const key of Object.keys(direct)) {
    keys.add(key);
  }
  for (const key of Object.keys(plan)) {
    keys.add(key);
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

function readPresentationField(
  presentation: ResolvedSlidePresentation,
  field: string,
): unknown {
  if (!Object.prototype.hasOwnProperty.call(presentation, field)) {
    return undefined;
  }
  return presentation[field as keyof ResolvedSlidePresentation];
}

/**
 * Compara apresentações pelo objeto integral (`canonicalJson` completo).
 * Campos divergentes são derivados dinamicamente da união de chaves.
 */
export function diffPresentationParity(
  direct: ResolvedSlidePresentation,
  plan: ResolvedSlidePresentation,
): PresentationFieldMismatch[] {
  if (canonicalJson(direct) === canonicalJson(plan)) {
    return [];
  }

  const mismatches: PresentationFieldMismatch[] = [];
  for (const field of presentationFieldKeys(direct, plan)) {
    const directValue = readPresentationField(direct, field);
    const planValue = readPresentationField(plan, field);
    if (canonicalJson(directValue) !== canonicalJson(planValue)) {
      mismatches.push({ field, direct: directValue, plan: planValue });
    }
  }
  return mismatches;
}

function compareThemes(direct: ThemeColors, plan: ThemeColors): boolean {
  return canonicalJson(direct) === canonicalJson(plan);
}

function countValidConduct(polarities: DangerZoneItemPolarity[] | undefined): number {
  if (!polarities?.length) return 0;
  return polarities.filter((p) => p === 'valid_conduct').length;
}

export type ResolveSlideParityInput = {
  slide: NeuroVisualPlanSlideInput;
  slug: string;
  slideIndex: number;
  familyId?: FamilyId;
  instruction?: string;
  options?: DangerZoneOptionLike[];
  allSlides: NeuroVisualPlanSlideInput[];
  questionMeta?: { subtopico?: string; pedagogical_branch?: string };
};

export type SlideParityCompareResult = {
  mismatch: SlideParityMismatch | null;
  dangerItemPolarities?: DangerZoneItemPolarity[];
  /** true quando polaridade do plano ≠ resolveDangerZoneItemPolarities direto. */
  polarityPathMismatch: boolean;
};

/** Compara caminho direto (resolveSlidePresentation) × encapsulado (NeuroVisualPlan v0). */
export function compareSlideVisualParityDetailed(
  input: ResolveSlideParityInput,
): SlideParityCompareResult {
  const presentationContext = enrichPresentationContext(
    {
      questionSlug: input.slug,
      slideIndex: input.slideIndex,
      jsonLayoutVariant: input.slide.layout_variant,
      familyId: input.familyId,
      options: input.options,
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
    questionOptions: input.options,
    questionSlides: input.allSlides,
    questionMeta: input.questionMeta,
    includeTheme: true,
  });

  const presentationMismatches = diffPresentationParity(directPresentation, plan.presentation);

  const directTheme = getThemeForSlide(input.slide, input.slug, input.slideIndex);
  const themeMismatch =
    plan.theme !== undefined && !compareThemes(directTheme, plan.theme)
      ? { direct: directTheme, plan: plan.theme }
      : undefined;

  let polarityPathMismatch = false;
  let dangerItemPolarities = plan.dangerItemPolarities;
  if (input.slide.type === 'danger_zone') {
    const directPolarities = resolveDangerZoneItemPolarities(
      input.slide.items as DangerZoneItemLike[] | undefined,
      {
        instruction: presentationContext.instruction,
        options: presentationContext.options,
      },
    );
    dangerItemPolarities = plan.dangerItemPolarities ?? directPolarities;
    polarityPathMismatch =
      canonicalJson(plan.dangerItemPolarities ?? []) !== canonicalJson(directPolarities);
  }

  if (presentationMismatches.length === 0 && !themeMismatch) {
    return {
      mismatch: null,
      dangerItemPolarities,
      polarityPathMismatch,
    };
  }

  return {
    mismatch: {
      slug: input.slug,
      slide_index: input.slideIndex,
      slide_type: String(input.slide.type ?? 'unknown'),
      presentation_mismatches: presentationMismatches,
      theme_mismatch: themeMismatch,
    },
    dangerItemPolarities,
    polarityPathMismatch,
  };
}

/** Compara caminho direto (resolveSlidePresentation) × encapsulado (NeuroVisualPlan v0). */
export function compareSlideVisualParity(input: ResolveSlideParityInput): SlideParityMismatch | null {
  return compareSlideVisualParityDetailed(input).mismatch;
}

function resolveQuestionSlideParities(
  question: QuestionJson,
  slug: string,
): {
  mismatches: SlideParityMismatch[];
  dangerZoneSlides: number;
  slidesWithValidConduct: number;
  validConductItems: number;
  polarityPathMismatches: number;
} {
  const slidesRaw = question.reverse_study_slides ?? question.study_slides;
  if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) {
    return {
      mismatches: [],
      dangerZoneSlides: 0,
      slidesWithValidConduct: 0,
      validConductItems: 0,
      polarityPathMismatches: 0,
    };
  }

  const meta = question.meta ?? {};
  const qd = question.question_data ?? {};
  const options = (qd.options ?? []).map((o) => ({
    id: o.id,
    text: o.text,
    is_correct: o.is_correct ?? false,
  }));
  const familyId = resolveQuestionFamilyId({
    instruction: qd.instruction,
    subtopico: meta.subtopico,
    options,
    textFragment: qd.text_fragment,
    metaFamily: meta.family as FamilyId | undefined,
  });

  const sorted = sortReverseStudySlides(
    slidesRaw.map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
  ) as NeuroVisualPlanSlideInput[];

  const mismatches: SlideParityMismatch[] = [];
  let dangerZoneSlides = 0;
  let slidesWithValidConduct = 0;
  let validConductItems = 0;
  let polarityPathMismatches = 0;

  sorted.forEach((slide, slideIndex) => {
    const result = compareSlideVisualParityDetailed({
      slide,
      slug,
      slideIndex,
      familyId,
      instruction: qd.instruction,
      options,
      allSlides: sorted,
      questionMeta: {
        subtopico: meta.subtopico,
        pedagogical_branch: meta.pedagogical_branch,
      },
    });
    if (result.mismatch) {
      mismatches.push(result.mismatch);
    }
    if (slide.type === 'danger_zone') {
      dangerZoneSlides += 1;
      const validCount = countValidConduct(result.dangerItemPolarities);
      validConductItems += validCount;
      if (validCount > 0) slidesWithValidConduct += 1;
      if (result.polarityPathMismatch) polarityPathMismatches += 1;
    }
  });

  return {
    mismatches,
    dangerZoneSlides,
    slidesWithValidConduct,
    validConductItems,
    polarityPathMismatches,
  };
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
  let dangerZoneSlides = 0;
  let slidesWithValidConduct = 0;
  let validConductItems = 0;
  let polarityPathMismatches = 0;

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

    const slideResult = resolveQuestionSlideParities(question, slug);
    dangerZoneSlides += slideResult.dangerZoneSlides;
    slidesWithValidConduct += slideResult.slidesWithValidConduct;
    validConductItems += slideResult.validConductItems;
    polarityPathMismatches += slideResult.polarityPathMismatches;
    totalMismatchCount += slideResult.mismatches.length;
    for (const m of slideResult.mismatches) {
      if (mismatches.length < maxSamples) {
        mismatches.push(m);
      }
    }
  }, catalog);

  if (polarityPathMismatches > 0) {
    limitations.push(
      `Polaridade plano≠direto em ${polarityPathMismatches} danger_zone(s) — divergência de caminho, não intencional.`,
    );
  }

  return {
    schema_version: 'neurovisual-plan-parity-v0',
    questions_processed: questionsProcessed,
    slides_compared: slidesCompared,
    slides_equivalent: slidesCompared - totalMismatchCount,
    mismatches,
    intentional_polarity: {
      danger_zone_slides: dangerZoneSlides,
      slides_with_valid_conduct: slidesWithValidConduct,
      valid_conduct_items: validConductItems,
      polarity_path_mismatches: polarityPathMismatches,
      note: INTENTIONAL_POLARITY_NOTE,
    },
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

/** Exit do audit: presentation/theme hard-fail; polaridade intencional não falha o gate. */
export function evaluateNeuroVisualPlanParityGate(report: NeuroVisualPlanParityReport): {
  ok: boolean;
  presentationMismatchTotal: number;
  polarityPathMismatchTotal: number;
} {
  const presentationMismatchTotal = report.slides_compared - report.slides_equivalent;
  const polarityPathMismatchTotal = report.intentional_polarity.polarity_path_mismatches;
  return {
    ok: presentationMismatchTotal === 0 && polarityPathMismatchTotal === 0,
    presentationMismatchTotal,
    polarityPathMismatchTotal,
  };
}
