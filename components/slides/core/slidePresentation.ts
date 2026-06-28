import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  getFamilyVisualSlideProfile,
  type FamilySlideType,
} from '@/lib/catalogMigration/familyLayoutProfile';
import { shouldApplySubtopicMold, isBespokeLayoutVariant } from '@/lib/slides/moldAffinity';
import { bespokeMoldHasRenderableSlots } from '@/lib/slides/moldSlotFit';
import {
  getLayoutVariantForBranch,
  getPresentationDesign,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import {
  calculateLayoutVariantFromType,
  getLayoutVariantBySubtopic,
  hasSubtopicCanonicalDesign,
} from './themeGenerator';
import {
  resolveConceptMapLayoutVariant,
  type ConceptMapItemLike,
  type LayoutRotationContext,
} from './conceptMapLayout';
import { resolveGoldenRuleLayoutVariant } from './goldenRuleLayout';
import { resolveLogicFlowLayoutVariant } from './logicFlowLayout';
import {
  resolveDangerZoneLayoutVariant,
  type DangerZoneItemLike,
} from './dangerZoneLayout';
import { resolveLogicFlowRevealMode } from './logicFlowRevealMode';
import { resolveDangerZoneRevealMode } from './dangerZoneRevealMode';
import { resolveSlideTitle } from './slideTitleResolve';
import { enhanceGoldenRuleRows } from './goldenRuleRowsEnhance';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { GoldenRuleRow } from '../variants/GoldenRule';
import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';
import type { DangerZoneBulletStyle } from './dangerZoneLayout';

export type ResolvedSlidePresentation = {
  layoutVariant: string;
  revealMode: LogicFlowRevealMode;
  dangerRevealMode: LogicFlowRevealMode;
  bulletStyle: DangerZoneBulletStyle;
  slideTitle?: string;
  rows?: GoldenRuleRow[];
  /** true quando molde bespoke foi rejeitado e caiu em família/genérico */
  moldFallback?: boolean;
};

export type SlidePresentationContext = {
  questionSlug?: string;
  slideIndex?: number;
  jsonLayoutVariant?: string;
  /** Família pedagógica (7 goldens) — âncora visual + pool de rotação por slug. */
  familyId?: FamilyId;
  /** Ramo pedagógico explícito ou inferido (L2.5). */
  pedagogicalBranch?: PedagogicalBranchId;
  /** Enunciado — usado na inferência de ramo quando necessário. */
  instruction?: string;
};

const FAMILY_SLIDE_TYPE_MAP: Record<string, FamilySlideType> = {
  concept_map: 'conceptMap',
  golden_rule: 'goldenRule',
  logic_flow: 'logicFlow',
  danger_zone: 'dangerZone',
};

function familySlideKey(slideType: string | undefined): FamilySlideType | null {
  if (!slideType) return null;
  return FAMILY_SLIDE_TYPE_MAP[slideType] ?? null;
}

type SlideInput = {
  type?: string;
  layout_variant?: string;
  items?: unknown[];
  concepts?: unknown[];
  steps?: unknown[];
  rows?: GoldenRuleRow[];
  bullet_style?: DangerZoneBulletStyle;
  reveal_mode?: LogicFlowRevealMode;
  slide_title?: string;
  meta?: { subtopico?: string; topico?: string };
};

function resolveSubtopicVariant(
  subtopico: string | undefined,
  slideType: string,
  slide: SlideInput,
  branch?: PedagogicalBranchId,
): string {
  if (subtopico && branch) {
    const fromBranch = getLayoutVariantForBranch(subtopico, slideType, branch);
    if (fromBranch) return fromBranch;
  }
  if (subtopico) {
    return getLayoutVariantBySubtopic(subtopico, slideType, slide);
  }
  return calculateLayoutVariantFromType(slideType, slide);
}

function hasPresentationDesign(subtopico: string | undefined, branch?: PedagogicalBranchId): boolean {
  if (!subtopico?.trim()) return false;
  if (getPresentationDesign(subtopico, branch)) return true;
  return hasSubtopicCanonicalDesign(subtopico);
}

function resolveCore(
  slide: SlideInput,
  presentationContext: SlidePresentationContext | undefined,
  options: { forceGenericMold: boolean },
): ResolvedSlidePresentation {
  const slideType = slide.type;
  const subtopico = slide.meta?.subtopico?.trim();
  const branch = presentationContext?.pedagogicalBranch;
  const hasDesign = hasPresentationDesign(subtopico, branch);
  const subtopicVariant = resolveSubtopicVariant(subtopico, slideType ?? '', slide, branch);
  const explicitLayoutVariant = presentationContext?.jsonLayoutVariant;

  const affinityCtx = {
    slideType,
    familyId: presentationContext?.familyId,
    subtopico,
    pedagogicalBranch: branch,
  };

  const subtopicMoldApplies =
    !options.forceGenericMold &&
    hasDesign &&
    shouldApplySubtopicMold(subtopicVariant, slide, affinityCtx) &&
    (!isBespokeLayoutVariant(subtopicVariant) ||
      bespokeMoldHasRenderableSlots(subtopicVariant, slide));

  const rotationCtx: LayoutRotationContext | undefined =
    !subtopicMoldApplies && presentationContext?.questionSlug
      ? {
          slug: presentationContext.questionSlug,
          slideIndex: presentationContext.slideIndex,
        }
      : undefined;

  const familySlide = presentationContext?.familyId ? familySlideKey(slideType) : null;
  const familyVisual =
    presentationContext?.familyId && familySlide
      ? getFamilyVisualSlideProfile(presentationContext.familyId, familySlide)
      : undefined;

  const semanticFallback = calculateLayoutVariantFromType(slideType ?? '', slide);
  const rotationAnchor = subtopicMoldApplies
    ? subtopicVariant
    : (familyVisual?.anchor ?? semanticFallback);
  const familyPool = subtopicMoldApplies ? undefined : familyVisual?.pool;

  let layoutVariant = explicitLayoutVariant || rotationAnchor;

  switch (slideType) {
    case 'concept_map':
      layoutVariant = resolveConceptMapLayoutVariant(
        {
          items: slide.items as ConceptMapItemLike[] | undefined,
          concepts: slide.concepts,
        },
        explicitLayoutVariant,
        rotationAnchor,
        rotationCtx,
      );
      break;
    case 'golden_rule':
      layoutVariant = resolveGoldenRuleLayoutVariant(
        slide,
        explicitLayoutVariant,
        rotationAnchor,
        rotationCtx,
        familyPool,
      );
      break;
    case 'logic_flow':
      layoutVariant = resolveLogicFlowLayoutVariant(
        slide,
        explicitLayoutVariant,
        rotationAnchor,
        rotationCtx,
      );
      break;
    case 'danger_zone':
      layoutVariant = resolveDangerZoneLayoutVariant(
        { items: slide.items as DangerZoneItemLike[] | undefined },
        explicitLayoutVariant,
        rotationAnchor,
        rotationCtx,
        familyPool,
      );
      break;
  }

  const steps = normalizeLogicFlowSteps(slide.steps);
  const revealMode = resolveLogicFlowRevealMode(steps.length, slide.reveal_mode);
  const dangerRevealMode =
    slideType === 'danger_zone'
      ? resolveDangerZoneRevealMode(
          layoutVariant,
          slide.items as DangerZoneItemLike[] | undefined,
          slide.reveal_mode,
        )
      : 'auto';
  const bulletStyle: DangerZoneBulletStyle =
    slide.bullet_style ??
    (slideType === 'danger_zone' &&
    (layoutVariant === 'compare' ||
      layoutVariant === 'trap-reveal' ||
      layoutVariant === 'calendar-mismatch' ||
      layoutVariant === 'norm-reveal' ||
      layoutVariant === 'scope-trap' ||
      layoutVariant === 'route-trap' ||
      layoutVariant === 'dose-trap' ||
      layoutVariant === 'farmaco-trap' ||
      layoutVariant === 'catheter-danger-arena' ||
      layoutVariant === 'lab-prep-trap' ||
      layoutVariant === 'lab-specimen-arena' ||
      layoutVariant === 'dressing-choice-arena' ||
      layoutVariant === 'vitals-classify-arena' ||
      layoutVariant === 'pni-trap-chips' ||
      layoutVariant === 'ist-trap-chips' ||
      layoutVariant === 'adolescent-consent-gate' ||
      layoutVariant === 'burn-trap-arena' ||
      layoutVariant === 'trabalho-pep-trap-arena' ||
      layoutVariant === 'respiratorio-spo2-trap-arena')
      ? 'x_icon'
      : 'numbered');

  const rows =
    slideType === 'golden_rule' && Array.isArray(slide.rows) && slide.rows.length > 0
      ? enhanceGoldenRuleRows(slide.rows)
      : slide.rows;

  return {
    layoutVariant,
    revealMode,
    dangerRevealMode,
    bulletStyle,
    slideTitle: resolveSlideTitle(slide),
    rows,
    moldFallback: options.forceGenericMold,
  };
}

/** Resolve layout, interação e título para um slide NeuroSlide. */
export function resolveSlidePresentation(
  slide: SlideInput,
  presentationContext?: SlidePresentationContext,
): ResolvedSlidePresentation {
  const first = resolveCore(slide, presentationContext, { forceGenericMold: false });

  if (
    isBespokeLayoutVariant(first.layoutVariant) &&
    !bespokeMoldHasRenderableSlots(first.layoutVariant, slide)
  ) {
    const fallback = resolveCore(slide, presentationContext, { forceGenericMold: true });
    return { ...fallback, moldFallback: true };
  }

  return first;
}

/** Enriquece contexto com ramo pedagógico inferido ou explícito em meta. */
export function enrichPresentationContext(
  base: SlidePresentationContext,
  slideMeta?: { subtopico?: string; pedagogical_branch?: string },
  instruction?: string,
  allSlides?: SlideInput[],
  questionMeta?: { subtopico?: string; pedagogical_branch?: string },
): SlidePresentationContext {
  const subtopico = slideMeta?.subtopico?.trim() || questionMeta?.subtopico?.trim();
  const explicitBranch =
    slideMeta?.pedagogical_branch?.trim() || questionMeta?.pedagogical_branch?.trim() || undefined;

  const branch = resolvePedagogicalBranch(
    subtopico,
    instruction ?? '',
    allSlides ?? [],
    explicitBranch,
    base.familyId,
  );
  return {
    ...base,
    pedagogicalBranch: branch,
    instruction,
  };
}
