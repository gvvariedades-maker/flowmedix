import { getThemeForSlide, type ThemeColors } from '@/components/slides/core/themeGenerator';
import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type ResolvedSlidePresentation,
  type SlidePresentationContext,
} from '@/components/slides/core/slidePresentation';
import type { FamilyId } from '@/components/slides/core/questionFamily';
import type { SlideType } from '@/types/lesson';

export const NEUROVISUAL_PLAN_SCHEMA_VERSION = 'neurovisual-plan-v0' as const;

export type NeuroVisualPlanSchemaVersion = typeof NEUROVISUAL_PLAN_SCHEMA_VERSION;

/** Entrada mínima aceita pelos resolvers atuais (slidePresentation). */
export type NeuroVisualPlanSlideInput = Parameters<typeof resolveSlidePresentation>[0];

export type NeuroVisualPlanV0 = {
  schema_version: NeuroVisualPlanSchemaVersion;
  slide_type: SlideType | string;
  presentation: ResolvedSlidePresentation;
  theme?: ThemeColors;
};

export type BuildNeuroVisualPlanV0Input = {
  slide: NeuroVisualPlanSlideInput;
  questionHash: string;
  slideIndex?: number;
  questionSlug?: string;
  jsonLayoutVariant?: string;
  familyId?: FamilyId;
  questionInstruction?: string;
  questionSlides?: NeuroVisualPlanSlideInput[];
  questionMeta?: { subtopico?: string; pedagogical_branch?: string };
  /** Quando false, omite theme (somente presentation). Padrão: true. */
  includeTheme?: boolean;
};

function resolveSlideType(slide: NeuroVisualPlanSlideInput): SlideType | string {
  return slide.type ?? 'unknown';
}

/**
 * Encapsula as decisões visuais já tomadas por resolveSlidePresentation (+ theme opcional).
 * Não duplica algoritmos — delega aos resolvers existentes como autoridade.
 */
export function buildNeuroVisualPlanV0(input: BuildNeuroVisualPlanV0Input): NeuroVisualPlanV0 {
  const presentationContext: SlidePresentationContext = enrichPresentationContext(
    {
      questionSlug: input.questionSlug ?? input.questionHash,
      slideIndex: input.slideIndex,
      jsonLayoutVariant: input.jsonLayoutVariant,
      familyId: input.familyId,
    },
    input.slide.meta,
    input.questionInstruction,
    input.questionSlides,
    input.questionMeta,
  );

  const presentation = resolveSlidePresentation(input.slide, presentationContext);

  const plan: NeuroVisualPlanV0 = {
    schema_version: NEUROVISUAL_PLAN_SCHEMA_VERSION,
    slide_type: resolveSlideType(input.slide),
    presentation,
  };

  if (input.includeTheme !== false) {
    plan.theme = getThemeForSlide(input.slide, input.questionHash, input.slideIndex);
  }

  return plan;
}

/** Campos de apresentação que afetam renderização (ResolvedSlidePresentation). */
export const PRESENTATION_PARITY_FIELDS = [
  'layoutVariant',
  'revealMode',
  'dangerRevealMode',
  'bulletStyle',
  'slideTitle',
  'rows',
  'moldFallback',
] as const satisfies readonly (keyof ResolvedSlidePresentation)[];

export type PresentationParityField = (typeof PRESENTATION_PARITY_FIELDS)[number];
