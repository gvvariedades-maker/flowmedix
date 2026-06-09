const LOGIC_FLOW_LAYOUT_OVERRIDES = new Set(['vertical', 'horizontal']);

/**
 * Resolve `layout_variant` do logic_flow.
 * - Com ≥3 passos → `cards` (salvo override explícito vertical/horizontal no JSON).
 */
export function resolveLogicFlowLayoutVariant(
  slide: { steps?: unknown[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
): string {
  const stepCount = Array.isArray(slide?.steps) ? slide.steps.length : 0;

  if (stepCount >= 3) {
    if (explicitVariant && LOGIC_FLOW_LAYOUT_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    return 'cards';
  }

  return explicitVariant || fallbackVariant || 'vertical';
}
