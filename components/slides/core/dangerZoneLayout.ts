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
  'farmaco-clinico-trap',
  'catheter-danger-arena',
  'lab-prep-trap',
  'lab-specimen-arena',
  'dressing-choice-arena',
  'vitals-classify-arena',
  'pni-trap-chips',
  'ist-trap-chips',
  'adolescent-consent-gate',
  'adolescent-z-threshold-trap',
  'burn-trap-arena',
  'trabalho-pep-trap-arena',
  'sp-safety-trap-arena',
  'respiratorio-spo2-trap-arena',
  'mental-raps-trap-arena',
  'mental-crisis-coercion-trap',
  'peri-preop-trap-arena',
  'peri-srpa-trap-arena',
  'peri-protocol-trap-arena',
  'peri-vf-trap-chips',
  'urgencias-rcp-trap-arena',
  'urgencias-trauma-trap-arena',
  'urgencias-stroke-trap-arena',
  'urgencias-shock-trap-arena',
  'urgencias-choking-trap-arena',
  'urgencias-pediatric-trap-arena',
  'urgencias-manchester-trap',
  'etiology-intruder-chips',
  'tb-transmission-trap',
  'itu-catheter-trap',
  'biosseg-trap-chips',
  'mulher-prenatal-trap-arena',
  'mulher-parto-trap-arena',
  'mulher-screening-trap-arena',
  'mulher-mama-trap-arena',
  'mulher-puerperio-trap-arena',
  'mulher-planejamento-trap-arena',
  'crianca-feeding-trap-arena',
  'crianca-screening-trap-arena',
  'crianca-pediatric-trap-arena',
  'crianca-dehydration-trap-arena',
  'crianca-puericultura-trap-arena',
  'crianca-neonatal-trap-arena',
  'crianca-dev-trap-arena',
  'cam-certos-trap-arena',
  'cam-high-risk-trap-arena',
  'cam-exceto-trap-arena',
  'cam-documentacao-trap-arena',
  'iv-label-swap-trap',
  'iv-gauge-mismatch-trap',
  'iv-exceto-intruder-trap',
  'iv-interval-swap-trap',
  'iv-order-invert-trap',
  'iv-bundle-break-trap',
  'pt-crase-trap-arena',
  'pt-clitic-trap-arena',
  'pt-comma-trap-arena',
  'pt-term-trap-arena',
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
  if (explicitVariant === 'farmaco-clinico-trap') return 'farmaco-clinico-trap';
  if (explicitVariant === 'catheter-danger-arena') return 'catheter-danger-arena';
  if (explicitVariant === 'lab-prep-trap') return 'lab-prep-trap';
  if (explicitVariant === 'lab-specimen-arena') return 'lab-specimen-arena';
  if (explicitVariant === 'dressing-choice-arena') return 'dressing-choice-arena';
  if (explicitVariant === 'vitals-classify-arena') return 'vitals-classify-arena';
  if (explicitVariant === 'pni-trap-chips') return 'pni-trap-chips';
  if (explicitVariant === 'ist-trap-chips') return 'ist-trap-chips';
  if (explicitVariant === 'etiology-intruder-chips') return 'etiology-intruder-chips';
  if (explicitVariant === 'tb-transmission-trap') return 'tb-transmission-trap';
  if (explicitVariant === 'itu-catheter-trap') return 'itu-catheter-trap';
  if (explicitVariant === 'biosseg-trap-chips') return 'biosseg-trap-chips';
  if (explicitVariant === 'adolescent-consent-gate') return 'adolescent-consent-gate';
  if (explicitVariant === 'adolescent-z-threshold-trap') return 'adolescent-z-threshold-trap';
  if (explicitVariant === 'burn-trap-arena') return 'burn-trap-arena';
  if (explicitVariant === 'trabalho-pep-trap-arena') return 'trabalho-pep-trap-arena';
  if (explicitVariant === 'respiratorio-spo2-trap-arena') return 'respiratorio-spo2-trap-arena';
  if (explicitVariant === 'mental-raps-trap-arena') return 'mental-raps-trap-arena';
  if (explicitVariant === 'mental-crisis-coercion-trap') return 'mental-crisis-coercion-trap';
  if (explicitVariant === 'peri-preop-trap-arena') return 'peri-preop-trap-arena';
  if (explicitVariant === 'peri-srpa-trap-arena') return 'peri-srpa-trap-arena';
  if (explicitVariant === 'peri-protocol-trap-arena') return 'peri-protocol-trap-arena';
  if (explicitVariant === 'peri-vf-trap-chips') return 'peri-vf-trap-chips';
  if (explicitVariant === 'urgencias-rcp-trap-arena') return 'urgencias-rcp-trap-arena';
  if (explicitVariant === 'urgencias-trauma-trap-arena') return 'urgencias-trauma-trap-arena';
  if (explicitVariant === 'urgencias-stroke-trap-arena') return 'urgencias-stroke-trap-arena';
  if (explicitVariant === 'urgencias-shock-trap-arena') return 'urgencias-shock-trap-arena';
  if (explicitVariant === 'urgencias-choking-trap-arena') return 'urgencias-choking-trap-arena';
  if (explicitVariant === 'urgencias-pediatric-trap-arena') return 'urgencias-pediatric-trap-arena';
  if (explicitVariant === 'urgencias-manchester-trap') return 'urgencias-manchester-trap';
  if (explicitVariant === 'cam-certos-trap-arena') return 'cam-certos-trap-arena';
  if (explicitVariant === 'cam-high-risk-trap-arena') return 'cam-high-risk-trap-arena';
  if (explicitVariant === 'cam-exceto-trap-arena') return 'cam-exceto-trap-arena';
  if (explicitVariant === 'cam-documentacao-trap-arena') return 'cam-documentacao-trap-arena';
  if (explicitVariant === 'iv-label-swap-trap') return 'iv-label-swap-trap';
  if (explicitVariant === 'iv-gauge-mismatch-trap') return 'iv-gauge-mismatch-trap';
  if (explicitVariant === 'iv-exceto-intruder-trap') return 'iv-exceto-intruder-trap';
  if (explicitVariant === 'iv-interval-swap-trap') return 'iv-interval-swap-trap';
  if (explicitVariant === 'iv-order-invert-trap') return 'iv-order-invert-trap';
  if (explicitVariant === 'iv-bundle-break-trap') return 'iv-bundle-break-trap';
  if (explicitVariant === 'pt-crase-trap-arena') return 'pt-crase-trap-arena';
  if (explicitVariant === 'pt-clitic-trap-arena') return 'pt-clitic-trap-arena';
  if (explicitVariant === 'pt-comma-trap-arena') return 'pt-comma-trap-arena';
  if (explicitVariant === 'pt-term-trap-arena') return 'pt-term-trap-arena';

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
    if (!explicitVariant && fallbackVariant === 'farmaco-clinico-trap') {
      return 'farmaco-clinico-trap';
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
    if (!explicitVariant && fallbackVariant === 'tb-transmission-trap') {
      return 'tb-transmission-trap';
    }
    if (!explicitVariant && fallbackVariant === 'itu-catheter-trap') {
      return 'itu-catheter-trap';
    }
    if (!explicitVariant && fallbackVariant === 'biosseg-trap-chips') {
      return 'biosseg-trap-chips';
    }
    if (!explicitVariant && fallbackVariant === 'adolescent-consent-gate') {
      return 'adolescent-consent-gate';
    }
    if (!explicitVariant && fallbackVariant === 'adolescent-z-threshold-trap') {
      return 'adolescent-z-threshold-trap';
    }
    if (!explicitVariant && fallbackVariant === 'burn-trap-arena') {
      return 'burn-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'trabalho-pep-trap-arena') {
      return 'trabalho-pep-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'sp-safety-trap-arena') {
      return 'sp-safety-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'respiratorio-spo2-trap-arena') {
      return 'respiratorio-spo2-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mental-raps-trap-arena') {
      return 'mental-raps-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mental-crisis-coercion-trap') {
      return 'mental-crisis-coercion-trap';
    }
    if (!explicitVariant && fallbackVariant === 'peri-preop-trap-arena') {
      return 'peri-preop-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'peri-srpa-trap-arena') {
      return 'peri-srpa-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'peri-protocol-trap-arena') {
      return 'peri-protocol-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'peri-vf-trap-chips') {
      return 'peri-vf-trap-chips';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-rcp-trap-arena') {
      return 'urgencias-rcp-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-trauma-trap-arena') {
      return 'urgencias-trauma-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-stroke-trap-arena') {
      return 'urgencias-stroke-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-shock-trap-arena') {
      return 'urgencias-shock-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-choking-trap-arena') {
      return 'urgencias-choking-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-pediatric-trap-arena') {
      return 'urgencias-pediatric-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'urgencias-manchester-trap') {
      return 'urgencias-manchester-trap';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-prenatal-trap-arena') {
      return 'mulher-prenatal-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-parto-trap-arena') {
      return 'mulher-parto-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-screening-trap-arena') {
      return 'mulher-screening-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-mama-trap-arena') {
      return 'mulher-mama-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-puerperio-trap-arena') {
      return 'mulher-puerperio-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'mulher-planejamento-trap-arena') {
      return 'mulher-planejamento-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-feeding-trap-arena') {
      return 'crianca-feeding-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-screening-trap-arena') {
      return 'crianca-screening-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-pediatric-trap-arena') {
      return 'crianca-pediatric-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-dehydration-trap-arena') {
      return 'crianca-dehydration-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-puericultura-trap-arena') {
      return 'crianca-puericultura-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-neonatal-trap-arena') {
      return 'crianca-neonatal-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'crianca-dev-trap-arena') {
      return 'crianca-dev-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'cam-certos-trap-arena') {
      return 'cam-certos-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'cam-high-risk-trap-arena') {
      return 'cam-high-risk-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'cam-exceto-trap-arena') {
      return 'cam-exceto-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'cam-documentacao-trap-arena') {
      return 'cam-documentacao-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'iv-label-swap-trap') {
      return 'iv-label-swap-trap';
    }
    if (!explicitVariant && fallbackVariant === 'iv-gauge-mismatch-trap') {
      return 'iv-gauge-mismatch-trap';
    }
    if (!explicitVariant && fallbackVariant === 'iv-exceto-intruder-trap') {
      return 'iv-exceto-intruder-trap';
    }
    if (!explicitVariant && fallbackVariant === 'iv-interval-swap-trap') {
      return 'iv-interval-swap-trap';
    }
    if (!explicitVariant && fallbackVariant === 'iv-order-invert-trap') {
      return 'iv-order-invert-trap';
    }
    if (!explicitVariant && fallbackVariant === 'iv-bundle-break-trap') {
      return 'iv-bundle-break-trap';
    }
    if (!explicitVariant && fallbackVariant === 'pt-crase-trap-arena') {
      return 'pt-crase-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'pt-clitic-trap-arena') {
      return 'pt-clitic-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'pt-comma-trap-arena') {
      return 'pt-comma-trap-arena';
    }
    if (!explicitVariant && fallbackVariant === 'pt-term-trap-arena') {
      return 'pt-term-trap-arena';
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
