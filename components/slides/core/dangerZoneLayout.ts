import { DANGER_ZONE_LAYOUT_POOL, pickRotatedLayoutVariant } from './layoutRotation';
import type { LayoutRotationContext } from './conceptMapLayout';

/** Item mínimo para decidir layout comparativo trap × correct. */
export type DangerZoneItemLike = {
  label?: string;
  detail?: string;
  correct?: string;
};

export type DangerZoneBulletStyle = 'numbered' | 'x_icon';

const DANGER_ZONE_LAYOUT_OVERRIDES = new Set([
  'cards',
  'compact',
  'trap-reveal',
  'calendar-mismatch',
  'temperature-mismatch',
  'norm-reveal',
  'scope-trap',
  'route-trap',
  'dose-trap',
  'farmaco-trap',
  'catheter-danger-arena',
  'lab-prep-trap',
  'lab-specimen-arena',
  'dressing-choice-arena',
  'vitals-classify-arena',
  'pni-trap-chips',
  'ist-trap-chips',
  'adolescent-consent-gate',
  'burn-trap-arena',
  'trabalho-pep-trap-arena',
  'respiratorio-spo2-trap-arena',
  'etiology-intruder-chips',
  'itu-catheter-trap',
]);

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
  ctx?: LayoutRotationContext,
  familyPool?: readonly string[],
): string {
  const items = slide?.items;
  const hasCompareItems =
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0);

  if (explicitVariant === 'compare') return 'compare';
  if (explicitVariant === 'trap-reveal') return 'trap-reveal';
  if (explicitVariant === 'calendar-mismatch') return 'calendar-mismatch';
  if (explicitVariant === 'temperature-mismatch') return 'temperature-mismatch';
  if (explicitVariant === 'norm-reveal') return 'norm-reveal';
  if (explicitVariant === 'scope-trap') return 'scope-trap';
  if (explicitVariant === 'route-trap') return 'route-trap';
  if (explicitVariant === 'dose-trap') return 'dose-trap';
  if (explicitVariant === 'farmaco-trap') return 'farmaco-trap';
  if (explicitVariant === 'catheter-danger-arena') return 'catheter-danger-arena';
  if (explicitVariant === 'lab-prep-trap') return 'lab-prep-trap';
  if (explicitVariant === 'lab-specimen-arena') return 'lab-specimen-arena';
  if (explicitVariant === 'dressing-choice-arena') return 'dressing-choice-arena';
  if (explicitVariant === 'vitals-classify-arena') return 'vitals-classify-arena';
  if (explicitVariant === 'pni-trap-chips') return 'pni-trap-chips';
  if (explicitVariant === 'ist-trap-chips') return 'ist-trap-chips';
  if (explicitVariant === 'etiology-intruder-chips') return 'etiology-intruder-chips';
  if (explicitVariant === 'itu-catheter-trap') return 'itu-catheter-trap';
  if (explicitVariant === 'adolescent-consent-gate') return 'adolescent-consent-gate';
  if (explicitVariant === 'burn-trap-arena') return 'burn-trap-arena';
  if (explicitVariant === 'trabalho-pep-trap-arena') return 'trabalho-pep-trap-arena';
  if (explicitVariant === 'respiratorio-spo2-trap-arena') return 'respiratorio-spo2-trap-arena';

  if (hasCompareItems) {
    if (explicitVariant && DANGER_ZONE_LAYOUT_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    if (!explicitVariant && fallbackVariant === 'trap-reveal') {
      return 'trap-reveal';
    }
    if (!explicitVariant && fallbackVariant === 'calendar-mismatch') {
      return 'calendar-mismatch';
    }
    if (!explicitVariant && fallbackVariant === 'temperature-mismatch') {
      return 'temperature-mismatch';
    }
    if (!explicitVariant && fallbackVariant === 'norm-reveal') {
      return 'norm-reveal';
    }
    if (!explicitVariant && fallbackVariant === 'scope-trap') {
      return 'scope-trap';
    }
    if (!explicitVariant && fallbackVariant === 'route-trap') {
      return 'route-trap';
    }
    if (!explicitVariant && fallbackVariant === 'dose-trap') {
      return 'dose-trap';
    }
    if (!explicitVariant && fallbackVariant === 'farmaco-trap') {
      return 'farmaco-trap';
    }
    if (!explicitVariant && fallbackVariant === 'catheter-danger-arena') {
      return 'catheter-danger-arena';
    }
    if (!explicitVariant && fallbackVariant === 'lab-prep-trap') {
      return 'lab-prep-trap';
    }
    if (!explicitVariant && fallbackVariant === 'lab-specimen-arena') {
      return 'lab-specimen-arena';
    }
    if (!explicitVariant && fallbackVariant === 'dressing-choice-arena') {
      return 'dressing-choice-arena';
    }
    if (!explicitVariant && fallbackVariant === 'vitals-classify-arena') {
      return 'vitals-classify-arena';
    }
    if (!explicitVariant && fallbackVariant === 'pni-trap-chips') {
      return 'pni-trap-chips';
    }
    if (!explicitVariant && fallbackVariant === 'ist-trap-chips') {
      return 'ist-trap-chips';
    }
    if (!explicitVariant && fallbackVariant === 'etiology-intruder-chips') {
      return 'etiology-intruder-chips';
    }
    if (!explicitVariant && fallbackVariant === 'itu-catheter-trap') {
      return 'itu-catheter-trap';
    }
    if (!explicitVariant && fallbackVariant === 'adolescent-consent-gate') {
      return 'adolescent-consent-gate';
    }
    if (!explicitVariant && fallbackVariant === 'burn-trap-arena') {
      return 'burn-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'trabalho-pep-trap-arena') {
      return 'trabalho-pep-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'respiratorio-spo2-trap-arena') {
      return 'respiratorio-spo2-trap-arena';
    }
    return 'compare';
  }

  if (explicitVariant) return explicitVariant;

  const pool = familyPool && familyPool.length > 0 ? familyPool : DANGER_ZONE_LAYOUT_POOL;
  if (ctx?.slug) {
    return pickRotatedLayoutVariant(
      pool,
      fallbackVariant ?? 'list',
      ctx.slug,
      ctx.slideIndex ?? 0,
      'danger_zone',
    );
  }

  return fallbackVariant || 'list';
}

export function dangerZoneHasCompareItems(items?: DangerZoneItemLike[]): boolean {
  return (
    Array.isArray(items) &&
    items.some((i) => typeof i.correct === 'string' && i.correct.trim().length > 0)
  );
}
