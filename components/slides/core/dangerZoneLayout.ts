/** Item mínimo para decidir layout comparativo trap × correct. */
export type DangerZoneItemLike = {
  label?: string;
  detail?: string;
  correct?: string;
};

export type DangerZoneBulletStyle = 'numbered' | 'x_icon';

const DANGER_ZONE_LAYOUT_OVERRIDES = new Set(['cards', 'compact']);

/**
 * Resolve `layout_variant` do danger_zone.
 * - Com `correct` (string não vazia) em ≥1 item → `compare` (conteúdo vence mapa compact).
 * - Bloqueia compare só com `layout_variant` explícito no JSON (cards/compact).
 * - `layout_variant: "compare"` força o layout mesmo sem itens com `correct`.
 */
export function resolveDangerZoneLayoutVariant(
  slide: { items?: DangerZoneItemLike[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
): string {
  const items = slide?.items;
  const hasCompareItems =
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0);

  if (explicitVariant === 'compare') return 'compare';

  if (hasCompareItems) {
    if (explicitVariant && DANGER_ZONE_LAYOUT_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    return 'compare';
  }

  return explicitVariant || fallbackVariant || 'list';
}

export function dangerZoneHasCompareItems(items?: DangerZoneItemLike[]): boolean {
  return (
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0)
  );
}
