/**
 * AVANT enf Brand V2.1 Golden Master — paths canônicos (runtime).
 * Fonte: pacote `AVANT-enf-brand-v2.1-golden-master/brand/**` (sem /legacy).
 */
export const AVANT_BRAND_V21 = {
  version: '2.1',
  symbol: '/brand/v2.1/symbol/avant-symbol-master.svg',
  horizontal: '/brand/v2.1/logo/avant-enf-horizontal.svg',
  /** viewBox 393.32 × 100 */
  horizontalAspect: 393.32 / 100,
  darkLockup: '/brand/v2.1/dark/avant-enf-lockup.svg',
  lightLockup: '/brand/v2.1/light/avant-enf-lockup.svg',
  wordmark: '/brand/v2.1/logo/avant-enf-wordmark.svg',
  compact: '/brand/v2.1/logo/avant-enf-compact.svg',
  appIconSvg: '/brand/v2.1/app-icon/app-icon-master.svg',
  faviconSvg: '/brand/v2.1/favicon/favicon-master.svg',
} as const;

export type AvantBrandV21Assets = typeof AVANT_BRAND_V21;
