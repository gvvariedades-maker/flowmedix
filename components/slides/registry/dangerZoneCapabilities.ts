/**
 * Capabilities de variantes danger_zone — dados puros (sem next/dynamic).
 * Usado por slidePresentation / resolveDangerZoneRevealMode.
 */

export type DangerZoneBulletStyleCap = 'x_icon' | 'numbered';

export type DangerZoneVariantCapabilities = {
  /** Default premium: compareRevealMode tap (salvo reveal_mode explícito). */
  dangerTapReveal?: boolean;
  /** Default de bullet_style quando o JSON omite. */
  defaultBulletStyle?: DangerZoneBulletStyleCap;
};

export const DANGER_ZONE_VARIANT_CAPABILITIES: Record<string, DangerZoneVariantCapabilities> = {
  'adolescent-consent-gate': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'adolescent-exceto-compare': { defaultBulletStyle: 'x_icon' },
  'pni-exceto-compare': { defaultBulletStyle: 'x_icon' },
  'pni-via-trap-arena': { dangerTapReveal: false, defaultBulletStyle: 'x_icon' },
  'adolescent-z-threshold-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'biosseg-trap-chips': { dangerTapReveal: true },
  'burn-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'calendar-mismatch': { dangerTapReveal: false, defaultBulletStyle: 'x_icon' },
  'cam-certos-trap-arena': { defaultBulletStyle: 'x_icon' },
  'cam-documentacao-trap-arena': { defaultBulletStyle: 'x_icon' },
  'cam-exceto-trap-arena': { defaultBulletStyle: 'x_icon' },
  'cam-high-risk-trap-arena': { defaultBulletStyle: 'x_icon' },
  'catheter-danger-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'compare': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'crianca-dehydration-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-dev-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-feeding-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-neonatal-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-pediatric-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-puericultura-trap-arena': { defaultBulletStyle: 'x_icon' },
  'crianca-screening-trap-arena': { defaultBulletStyle: 'x_icon' },
  'dose-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'dressing-choice-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'farmaco-clinico-trap': { defaultBulletStyle: 'x_icon' },
  'farmaco-trap': { defaultBulletStyle: 'x_icon' },
  'ist-trap-chips': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'itu-catheter-trap': { dangerTapReveal: true },
  'iv-bundle-break-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'iv-exceto-intruder-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'iv-gauge-mismatch-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'iv-interval-swap-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'iv-label-swap-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'iv-order-invert-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'lab-prep-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'lab-specimen-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'mental-crisis-coercion-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'mental-raps-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'mulher-mama-trap-arena': { defaultBulletStyle: 'x_icon' },
  'mulher-parto-trap-arena': { defaultBulletStyle: 'x_icon' },
  'mulher-prenatal-trap-arena': { defaultBulletStyle: 'x_icon' },
  'mulher-screening-trap-arena': { defaultBulletStyle: 'x_icon' },
  'norm-reveal': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'peri-preop-trap-arena': { dangerTapReveal: true },
  'peri-protocol-trap-arena': { dangerTapReveal: true },
  'peri-srpa-trap-arena': { dangerTapReveal: true },
  'peri-vf-trap-chips': { dangerTapReveal: true },
  'pni-trap-chips': { dangerTapReveal: false, defaultBulletStyle: 'x_icon' },
  'pt-clitic-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'pt-comma-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'pt-crase-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'pt-subject-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'pt-term-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'respiratorio-spo2-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'route-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'scope-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'temperature-mismatch': { dangerTapReveal: false, defaultBulletStyle: 'x_icon' },
  'trabalho-pep-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'trap-reveal': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-choking-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-manchester-trap': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-pediatric-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-rcp-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-shock-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-stroke-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'urgencias-trauma-trap-arena': { dangerTapReveal: true, defaultBulletStyle: 'x_icon' },
  'vitals-classify-arena': { dangerTapReveal: false, defaultBulletStyle: 'x_icon' },
};

export function getDangerZoneVariantCapabilities(
  layoutVariant: string,
): DangerZoneVariantCapabilities | undefined {
  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant];
}

export function dangerZoneVariantUsesTapReveal(layoutVariant: string): boolean {
  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant]?.dangerTapReveal === true;
}

export function dangerZoneVariantDefaultBulletStyle(layoutVariant: string): 'x_icon' | undefined {
  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant]?.defaultBulletStyle === 'x_icon'
    ? 'x_icon'
    : undefined;
}
