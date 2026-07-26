import { getThemeForSlide, type ThemeColors } from '@/components/slides/core/themeGenerator';
import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type ResolvedSlidePresentation,
  type SlidePresentationContext,
} from '@/components/slides/core/slidePresentation';
import type { FamilyId } from '@/components/slides/core/questionFamily';

export const NEUROVISUAL_PLAN_SCHEMA_VERSION = 'neurovisual-plan-v0' as const;

export type NeuroVisualPlanSchemaVersion = typeof NEUROVISUAL_PLAN_SCHEMA_VERSION;

/** Entrada mínima aceita pelos resolvers atuais (slidePresentation). */
export type NeuroVisualPlanSlideInput = Parameters<typeof resolveSlidePresentation>[0];

/** Tipo capturado do slide de entrada; inclui legado `type?: string` e fallback `'unknown'`. */
export type NeuroVisualPlanSlideType = NonNullable<NeuroVisualPlanSlideInput['type']> | 'unknown';

/**
 * Plano visual determinístico (shadow mode).
 *
 * `theme` é opcional somente quando `includeTheme: false` em `buildNeuroVisualPlanV0`.
 * No caminho padrão (`includeTheme` omitido ou `true`), `theme` é sempre preenchido com
 * o retorno de `getThemeForSlide` — nunca `undefined`.
 */
export type NeuroVisualPlanV0 = {
  schema_version: NeuroVisualPlanSchemaVersion;
  slide_type: NeuroVisualPlanSlideType;
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
  /**
   * Quando `false`, omite `theme` do plano (somente `presentation`).
   * Padrão: `true` — resolve e inclui `ThemeColors` via `getThemeForSlide`.
   */
  includeTheme?: boolean;
};

function resolveSlideType(slide: NeuroVisualPlanSlideInput): NeuroVisualPlanSlideType {
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
