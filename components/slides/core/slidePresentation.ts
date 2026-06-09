import { calculateLayoutVariant } from './themeGenerator';
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
import { resolveSlideTitle } from './slideTitleResolve';
import { enhanceGoldenRuleRows } from './goldenRuleRowsEnhance';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { GoldenRuleRow } from '../variants/GoldenRule';
import type { LogicFlowRevealMode } from '../variants/logicFlowReveal';
import type { DangerZoneBulletStyle } from './dangerZoneLayout';

export type ResolvedSlidePresentation = {
  layoutVariant: string;
  revealMode: LogicFlowRevealMode;
  bulletStyle: DangerZoneBulletStyle;
  slideTitle?: string;
  rows?: GoldenRuleRow[];
};

export type SlidePresentationContext = {
  questionSlug?: string;
  slideIndex?: number;
  jsonLayoutVariant?: string;
};

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
  const mapLayoutVariant = calculateLayoutVariant(slide);
  const explicitLayoutVariant = presentationContext?.jsonLayoutVariant;

  const rotationCtx: LayoutRotationContext | undefined =
    presentationContext?.questionSlug
      ? {
          slug: presentationContext.questionSlug,
          slideIndex: presentationContext.slideIndex,
        }
      : undefined;

  let layoutVariant = explicitLayoutVariant || mapLayoutVariant;

  switch (slideType) {
    case 'concept_map':
      layoutVariant = resolveConceptMapLayoutVariant(
        {
          items: slide.items as ConceptMapItemLike[] | undefined,
          concepts: slide.concepts,
        },
        explicitLayoutVariant,
        mapLayoutVariant,
        rotationCtx,
      );
      break;
    case 'golden_rule':
      layoutVariant = resolveGoldenRuleLayoutVariant(
        slide,
        explicitLayoutVariant,
        mapLayoutVariant,
      );
      break;
    case 'logic_flow':
      layoutVariant = resolveLogicFlowLayoutVariant(
        slide,
        explicitLayoutVariant,
        mapLayoutVariant,
        rotationCtx,
      );
      break;
    case 'danger_zone':
      layoutVariant = resolveDangerZoneLayoutVariant(
        { items: slide.items as DangerZoneItemLike[] | undefined },
        explicitLayoutVariant,
        mapLayoutVariant,
      );
      break;
  }

  const steps = normalizeLogicFlowSteps(slide.steps);
  const revealMode = resolveLogicFlowRevealMode(steps.length, slide.reveal_mode);
  const bulletStyle: DangerZoneBulletStyle =
    slide.bullet_style ??
    (slideType === 'danger_zone' && layoutVariant === 'compare' ? 'x_icon' : 'numbered');

  const rows =
    slideType === 'golden_rule' && Array.isArray(slide.rows) && slide.rows.length > 0
      ? enhanceGoldenRuleRows(slide.rows)
      : slide.rows;

  return {
    layoutVariant,
    revealMode,
    bulletStyle,
    slideTitle: resolveSlideTitle(slide),
    rows,
  };
}
