/**
 * AVANT enf logo — identidade oficial "Brushed Copper" + acento print `#F26522`.
 *
 * Direção de marca (rebrand editorial 2026-08):
 * - Ícone: card squircle (`iconCardBrand` = print laranja) + monograma "A"
 *   fragmentado em metal cobre/laranja escovado (`brandBlue*`) — ver
 *   `public/brand/avant-logo-shield.png` (PNG ainda pode estar verde até
 *   fechar o checklist em `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md`).
 * - Wordmark "AVANT": mesmo metal cobre escovado do monograma (raster,
 *   `avant-logo-wordmark-raster.png`).
 * - Sufixo "enf": verde glass (`wordmarkEnfGreen*`) — mantido até decisão
 *   de asset; não confundir com CTA/anel de marca.
 * - Anéis, hairlines, glows e shell do lockup cyber → família `EDITORIAL_BRAND`
 *   (`#F26522`), não lima legado `#8fe020` / `#0cc93a`.
 * - `brandBlue*` é metal do wordmark/monograma (não sobrescrever com o print
 *   de CTA). Nome legado mantido por compatibilidade.
 * - Tracking aéreo no wordmark; "enf" em minúsculas sem bullet.
 */

import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';

export type AvantLogoSizeToken = 'nav' | 'md' | 'lg';

export const AVANT_LOGO_SIZE_SCALE: Record<AvantLogoSizeToken, number> = {
  nav: 0.9,
  md: 1.02,
  lg: 1.12,
} as const;

export function getAvantLogoScale(size: AvantLogoSizeToken): number {
  return AVANT_LOGO_SIZE_SCALE[size];
}

export function scaleAvantLogoPx(base: number, size: AvantLogoSizeToken): number {
  return Math.round(base * getAvantLogoScale(size));
}

/** Tracking aéreo (~0.22em) — luxury signifier. */
export const AVANT_LOGO_WORDMARK_LETTER_SPACING: Record<AvantLogoSizeToken, number> = {
  nav: 3.2,
  md: 4.2,
  lg: 5.2,
} as const;

export function getAvantLogoWordmarkLetterSpacing(size: AvantLogoSizeToken): number {
  const base = AVANT_LOGO_WORDMARK_LETTER_SPACING[size];
  return Math.round(base * getAvantLogoScale(size) * 10) / 10;
}

/** RGBA do print — espelha opacidades usadas em anéis/glows do lockup. */
const BRAND_RING = {
  hairline: 'rgba(242, 101, 34, 0.28)',
  outer: 'rgba(242, 101, 34, 0.30)',
  cyberHairline: 'rgba(242, 101, 34, 0.35)',
  glow: 'rgba(242, 101, 34, 0.18)',
  shellRest: 'rgba(242, 101, 34, 0.20)',
  shellPeak: 'rgba(242, 101, 34, 0.40)',
  shellPeakSoft: 'rgba(242, 101, 34, 0.12)',
  shellMid: 'rgba(242, 101, 34, 0.35)',
  shellDeep: 'rgba(154, 52, 18, 0.45)',
} as const;

export const AVANT_LOGO_COLORS = {
  /**
   * Forest legado do selo e-mail / monograma CSS — manter até recolor de PNG
   * e decisão sobre "enf" (não é o acento de CTA).
   */
  iconForest: '#166534',
  iconForestDeep: '#14532d',
  /** Gradiente vertical sutil — profundidade tipo foil, sem candy. */
  iconForestGradient: 'linear-gradient(165deg, #1a7a3e 0%, #166534 42%, #14532d 100%)',
  iconCyberBg: '#0d0d18',
  /** Anel cyber do lockup — print editorial. */
  iconCyberRing: EDITORIAL_BRAND.hex,
  /**
   * Card do monograma / fundo de marca do ícone — print `#F26522`.
   * PNG squircle deve acompanhar (ver checklist de assets).
   */
  iconCardBrand: EDITORIAL_BRAND.hex,
  /**
   * @deprecated Preferir `iconCardBrand` (mesmo valor). Alias pós-rebrand.
   */
  iconCardGreen: EDITORIAL_BRAND.hex,
  monogramFill: '#ffffff',
  /**
   * Cobre/laranja de marca oficial — metal escovado do monograma "A" e do
   * wordmark "AVANT" (`avant-logo-shield.png` / `avant-logo-wordmark-raster.png`).
   * Sampleado do asset: highlight ~#f2ad46, mid ~#b46c48, sombra ~#4b1e03.
   * Nome da constante (`brandBlue*`) mantido por compatibilidade histórica.
   * Não confundir com `EDITORIAL_BRAND` / `iconCardBrand` (CTA / squircle).
   */
  brandBlue: '#e08f2f',
  brandBlueLight: '#fcbd7d',
  brandBlueDeep: '#63340b',
  /** Anel interno (emboss / selo). */
  iconInsetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.18)',
  iconOuterShadowEditorial: `0 1px 2px rgba(15, 23, 42, 0.06), 0 2px 6px ${BRAND_RING.shellPeakSoft}`,
  iconOuterShadowCyber: `0 0 0 1px ${BRAND_RING.outer}`,
  lockupInnerBg: '#0d0d18',
  lockupInnerInsetShadow:
    'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.20)',
  accentBar: '#38bdf8',
  accentBarGlow: 'rgba(56, 189, 248, 0.28)',
  wordmarkLight: '#0f172a',
  wordmarkEditorial: '#0f172a',
  wordmarkCyber: '#f8fafc',
  subtitleEditorial: '#64748b',
  subtitleLight: '#64748b',
  subtitleCyber: '#94a3b8',
  hairlineEditorial: BRAND_RING.hairline,
  hairlineCyber: BRAND_RING.cyberHairline,
  wordmarkGlow: BRAND_RING.glow,
  /** "AVANT" metal cobre escovado (mesmo modelo do emblema) — tom sólido para e-mail. */
  wordmarkBrandBlueSolid: '#e08f2f',
  /** "enf" em verde vivo, tom sólido para e-mail (sem gradiente) — asset pending. */
  wordmarkEnfGreen: '#0b7a53',
  wordmarkEnfGreenDeep: '#054a33',
} as const;

export const AVANT_LOGO_GRADIENTS = {
  icon: AVANT_LOGO_COLORS.iconForestGradient,
  /** Fallback CSS do wordmark (lockup raster é a fonte de verdade no app). */
  wordmark: `linear-gradient(130deg, ${EDITORIAL_BRAND.washBg} 0%, ${EDITORIAL_BRAND.textOnDark} 45%, ${EDITORIAL_BRAND.hex} 100%)`,
  wordmarkStops: [EDITORIAL_BRAND.washBg, EDITORIAL_BRAND.textOnDark, EDITORIAL_BRAND.hex] as const,
  shellBorder: `linear-gradient(160deg, rgba(255,255,255,0.14) 0%, ${BRAND_RING.shellMid} 50%, ${BRAND_RING.shellDeep} 100%)`,
  /** Texto "AVANT" metalizado — mesmo metal cobre escovado do emblema (foil gradient). */
  wordmarkBrandGradient:
    'linear-gradient(135deg, #fbdfbf 0%, #fcbd7d 22%, #e08f2f 45%, #63340b 62%, #f2ad46 80%, #e08f2f 100%)',
  /** Verde esmeralda de "enf" — combina com o fundo do brasao legado até recolor. */
  wordmarkEnfGreen: 'linear-gradient(160deg, #109466 0%, #0b7a53 55%, #054a33 100%)',
} as const;

export const AVANT_LOGO_DIMENSIONS = {
  icon: {
    /** Glass Ae tile reads optically larger than legacy shield — slightly smaller box. */
    size: 50,
    radius: 25,
  },
  lockupInner: {
    radius: 14,
    paddingTop: 10,
    paddingRight: 24,
    paddingBottom: 10,
    paddingLeft: 10,
    accentBarWidth: 2,
    /** Extra air between glass tile and wordmark raster. */
    gap: 18,
  },
  lockupShell: {
    radius: 16,
    padding: 1,
  },
  wordmark: {
    fontSize: 19,
    letterSpacingPx: 5.2,
    fontWeight: 600,
    lineHeight: 1.05,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacingPx: 3.2,
    lineHeight: 1,
    gapFromWordmark: 7,
    /** Minúsculo — mesmo lockup "AVANT enf" do emblema dourado/esmeralda. */
    label: 'enf',
    hairlineWidth: 18,
    hairlineHeight: 1,
  },
} as const;

/** Wordmark raster PNG — proporção do lockup AVANT + enf (Canva v4). */
export const AVANT_LOGO_WORDMARK_RASTER = {
  /** Altura relativa ao fontSize base (legível no header mobile e sidebar). */
  scale: 1.62,
  aspect: 3750 / 640,
} as const;

/** Monograma squircle — quase full-bleed no slot do ícone. */
export const AVANT_LOGO_ICON_INSET_SCALE = 0.96;

/**
 * Abaixo deste token, o monograma de vidro (glass 3D) fica detalhado demais
 * para ler bem — usar a versão flat (avant-logo-ae-flat.png).
 */
export const AVANT_LOGO_ICON_FLAT_BELOW: AvantLogoSizeToken = 'nav';

export function getAvantLogoWordmarkRasterSize(size: AvantLogoSizeToken): {
  width: number;
  height: number;
} {
  const fontSize = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.wordmark.fontSize, size);
  const height = Math.round(fontSize * AVANT_LOGO_DIMENSIONS.wordmark.lineHeight * AVANT_LOGO_WORDMARK_RASTER.scale);
  const width = Math.round(height * AVANT_LOGO_WORDMARK_RASTER.aspect);
  return { width, height };
}

/**
 * Monograma AE interlocked (viewBox 0 0 56 56).
 * Travessão do A atravessa o spine e vira a barra média do E = um só motivo.
 * Verticais ~3.2 · horizontais ~2.0 (contraste Didone geométrico).
 */
export const AVANT_AE_MONOGRAM_PATHS = [
  /** Spine vertical (peso forte) */
  'M26.4 10.2h3.2v35.6h-3.2z',
  /** Asa esquerda do A */
  'M26.4 10.2L11.8 45.8h3.9L26.4 15.6z',
  /** Travessão interlock A→E (peso fino, contínua) */
  'M15.4 28.4H43.2v2H15.4z',
  /** Barra superior do E */
  'M29.6 10.2h13.6v2H29.6z',
  /** Barra inferior do E */
  'M29.6 43.8h13.6v2H29.6z',
] as const;

export const AVANT_LOGO_SHELL_SHADOW = {
  rest: `0 0 0 1px ${BRAND_RING.shellRest}, 0 4px 20px rgba(0, 0, 0, 0.35)`,
  peak: `0 0 0 1px ${BRAND_RING.shellPeak}, 0 4px 28px ${BRAND_RING.shellPeakSoft}`,
} as const;

export const AVANT_LOGO_ANIMATION = {
  pulseKeyframes: 'avantLogoPulse',
  pulseClassName: 'avant-logo-pulse',
  pulseDuration: '4s',
  pulseTiming: 'cubic-bezier(0.4, 0, 0.6, 1)',
  pulseIteration: 'infinite',
} as const;

export const AVANT_LOGO_FONT_FAMILY =
  'var(--font-plus-jakarta-sans, "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif)';

export function getAvantLogoLockupPadding(size: AvantLogoSizeToken = 'lg'): string {
  const s = getAvantLogoScale(size);
  const d = AVANT_LOGO_DIMENSIONS.lockupInner;
  const t = scaleAvantLogoPx(d.paddingTop, size);
  const r = Math.round(d.paddingRight * s);
  const b = scaleAvantLogoPx(d.paddingBottom, size);
  const l = scaleAvantLogoPx(d.paddingLeft, size);
  return `${t}px ${r}px ${b}px ${l}px`;
}
