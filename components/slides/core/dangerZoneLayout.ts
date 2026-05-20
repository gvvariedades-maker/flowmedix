/** Item mínimo para decidir layout comparativo trap × correct. */
export type DangerZoneItemLike = {
  correct?: string;
};

export type DangerZoneBulletStyle = 'numbered' | 'x_icon';

/**
 * Resolve `layout_variant` do danger_zone.
 * - Com `correct` (string não vazia) em ≥1 item → `compare` (salvo override explícito cards/compact).
 * - `layout_variant: "compare"` força o layout mesmo sem itens com `correct`.
 */
export function resolveDangerZoneLayoutVariant(
  slide: { items?: DangerZoneItemLike[] } | undefined,
  explicitVariant?: string,
): string {
  const items = slide?.items;
  const hasCompareItems =
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0);

  if (explicitVariant === 'compare') return 'compare';

  if (hasCompareItems) {
    const legacyOnly =
      !explicitVariant || explicitVariant === 'list' || explicitVariant === 'compare';
    if (legacyOnly) return 'compare';
  }

  return explicitVariant || 'list';
}

export function dangerZoneHasCompareItems(items?: DangerZoneItemLike[]): boolean {
  return (
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0)
  );
}
