import { generateRobustQuestionHash } from './themeGenerator';

export const CONCEPT_MAP_GEOMETRIC_POOL = ['bridge', 'grid', 'molecular'] as const;
export const LOGIC_FLOW_POOL = ['horizontal', 'vertical', 'cards'] as const;

const DEFAULT_ANCHOR = 'grid';

function familyDefaultToBaseIndex(pool: readonly string[], familyDefault: string): number {
  const idx = pool.indexOf(familyDefault);
  if (idx >= 0) return idx;
  const gridIdx = pool.indexOf(DEFAULT_ANCHOR);
  return gridIdx >= 0 ? gridIdx : 0;
}

/**
 * Escolhe layout no pool com offset cíclico a partir da âncora da família (subtópico).
 * Determinístico por slug + slideIndex + slideType.
 */
export function pickRotatedLayoutVariant(
  pool: readonly string[],
  familyDefault: string,
  slug: string,
  slideIndex: number,
  slideType: string,
): string {
  if (pool.length === 0) return familyDefault || DEFAULT_ANCHOR;

  const baseIndex = familyDefaultToBaseIndex(pool, familyDefault);
  const offset = generateRobustQuestionHash(slug, slideIndex, slideType) % pool.length;
  return pool[(baseIndex + offset) % pool.length];
}
