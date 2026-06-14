import { LOGIC_FLOW_POOL, pickRotatedLayoutVariant } from './layoutRotation';
import type { LayoutRotationContext } from './conceptMapLayout';

const LOGIC_FLOW_LAYOUT_OVERRIDES = new Set([
  'vertical',
  'horizontal',
  'cards',
  'oxygen-step-ladder',
  'iv-care-soft-stack',
]);

const LOGIC_FLOW_MOLD_OVERRIDES = new Set(['oxygen-step-ladder', 'iv-care-soft-stack']);

/**
 * Resolve `layout_variant` do logic_flow.
 * - Com ≥3 passos → rotação horizontal/vertical/cards por slug (salvo override explícito no JSON).
 */
export function resolveLogicFlowLayoutVariant(
  slide: { steps?: unknown[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
  ctx?: LayoutRotationContext,
): string {
  const stepCount = Array.isArray(slide?.steps) ? slide.steps.length : 0;

  if (stepCount >= 3) {
    if (explicitVariant) {
      return explicitVariant;
    }
    if (fallbackVariant && LOGIC_FLOW_MOLD_OVERRIDES.has(fallbackVariant)) {
      return fallbackVariant;
    }
    if (ctx?.slug) {
      return pickRotatedLayoutVariant(
        LOGIC_FLOW_POOL,
        fallbackVariant ?? 'cards',
        ctx.slug,
        ctx.slideIndex ?? 0,
        'logic_flow',
      );
    }
    return fallbackVariant ?? 'cards';
  }

  return explicitVariant || fallbackVariant || 'vertical';
}
