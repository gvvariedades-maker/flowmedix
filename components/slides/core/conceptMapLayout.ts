import {
  CONCEPT_MAP_GEOMETRIC_POOL,
  pickRotatedLayoutVariant,
} from './layoutRotation';

/** Item mínimo para decidir layout morfológico no concept_map. */
export type ConceptMapItemLike = { label?: string; title?: string };

export type LayoutRotationContext = {
  slug?: string;
  slideIndex?: number;
};

/** Moldes premium por subtópico — vencem regra stack (≤2 itens) e rotação geométrica. */
const CONCEPT_MAP_MOLD_OVERRIDES = new Set([
  'procedure-protocol',
  'vitals-panel',
  'survival-chain',
  'vaccine-timeline',
  'sae-documentation',
  'sae-responsibility-matrix',
  'sus-legal-pillars',
  'sus-art4-orbit',
  'absorption-speed-rail',
  'dose-equivalence-rail',
]);

function countConceptItems(slide?: {
  items?: ConceptMapItemLike[];
  concepts?: unknown[];
}): number {
  return slide?.items?.length || slide?.concepts?.length || 0;
}

/**
 * Resolve `layout_variant` do concept_map.
 * - Com ≥3 itens → rotação bridge/grid/molecular por slug (salvo override explícito no JSON).
 * - Com 1–2 itens → `stack`.
 */
export function resolveConceptMapLayoutVariant(
  slide: { items?: ConceptMapItemLike[]; concepts?: unknown[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
  ctx?: LayoutRotationContext,
): string {
  const count = countConceptItems(slide);

  if (explicitVariant) {
    return explicitVariant;
  }

  if (fallbackVariant && CONCEPT_MAP_MOLD_OVERRIDES.has(fallbackVariant)) {
    return fallbackVariant;
  }

  if (count >= 3) {
    if (ctx?.slug) {
      return pickRotatedLayoutVariant(
        CONCEPT_MAP_GEOMETRIC_POOL,
        fallbackVariant ?? 'grid',
        ctx.slug,
        ctx.slideIndex ?? 0,
        'concept_map',
      );
    }
    return fallbackVariant ?? 'morphological';
  }

  if (count > 0 && count <= 2) {
    if (explicitVariant === 'stack' || explicitVariant === 'grid') {
      return explicitVariant;
    }
    return 'stack';
  }

  return explicitVariant || fallbackVariant || 'grid';
}
