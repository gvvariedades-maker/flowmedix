/** Item mínimo para decidir layout morfológico no concept_map. */
export type ConceptMapItemLike = { label?: string; title?: string };

const CONCEPT_MAP_LAYOUT_OVERRIDES = new Set(['grid', 'bridge', 'molecular', 'stack']);

function countConceptItems(slide?: {
  items?: ConceptMapItemLike[];
  concepts?: unknown[];
}): number {
  return slide?.items?.length || slide?.concepts?.length || 0;
}

/**
 * Resolve `layout_variant` do concept_map.
 * - Com ≥3 itens → `morphological` (salvo override explícito no JSON).
 * - Com 1–2 itens → `stack`.
 */
export function resolveConceptMapLayoutVariant(
  slide: { items?: ConceptMapItemLike[]; concepts?: unknown[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
): string {
  const count = countConceptItems(slide);

  if (count >= 3) {
    if (explicitVariant && CONCEPT_MAP_LAYOUT_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    return 'morphological';
  }

  if (count > 0 && count <= 2) {
    if (explicitVariant === 'stack' || explicitVariant === 'grid') {
      return explicitVariant;
    }
    return 'stack';
  }

  return explicitVariant || fallbackVariant || 'grid';
}
