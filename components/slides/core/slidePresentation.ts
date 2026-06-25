import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  getFamilyVisualSlideProfile,
  type FamilySlideType,
} from '@/lib/catalogMigration/familyLayoutProfile';
import { calculateLayoutVariant, hasSubtopicCanonicalDesign } from './themeGenerator';
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
};

export type SlidePresentationContext = {
  questionSlug?: string;
  slideIndex?: number;
  jsonLayoutVariant?: string;
  /** Família pedagógica (7 goldens) — âncora visual + pool de rotação por slug. */
  familyId?: FamilyId;
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

/** Resolve layout, interação e título para um slide NeuroSlide. */
export function resolveSlidePresentation(
  slide: {
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
  },
  presentationContext?: SlidePresentationContext,
): ResolvedSlidePresentation {
  const slideType = slide.type;
  const subtopico = slide.meta?.subtopico?.trim();
  const useSubtopicMold = hasSubtopicCanonicalDesign(subtopico);
  const subtopicFallback = calculateLayoutVariant(slide);
  const explicitLayoutVariant = presentationContext?.jsonLayoutVariant;

  const rotationCtx: LayoutRotationContext | undefined =
    !useSubtopicMold && presentationContext?.questionSlug
      ? {
          slug: presentationContext.questionSlug,
          slideIndex: presentationContext.slideIndex,
        }
      : undefined;

  const familySlide = presentationContext?.familyId
    ? familySlideKey(slideType)
    : null;
  const familyVisual =
    presentationContext?.familyId && familySlide
      ? getFamilyVisualSlideProfile(presentationContext.familyId, familySlide)
      : undefined;

  const rotationAnchor = useSubtopicMold
    ? subtopicFallback
    : (familyVisual?.anchor ?? subtopicFallback);
  const familyPool = useSubtopicMold ? undefined : familyVisual?.pool;

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
      ? resolveDangerZoneRevealMode(layoutVariant, slide.items as DangerZoneItemLike[] | undefined, slide.reveal_mode)
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
      layoutVariant === 'trabalho-pep-trap-arena')
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
  };
}
