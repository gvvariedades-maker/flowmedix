/**
 * AVANT Enf logo — Protocolo AE Ultra Premium.
 *
 * Pesquisa (monogram/luxury/healthcare):
 * - Monograma = letras fundidas (interlock), não lettermark lado a lado
 * - Contraste vertical/horizontal (tradição Didone em geometria)
 * - Selagem circular (enclosed) > squircle de app icon
 * - Tracking aéreo no wordmark; ENF em small-caps sem bullet
 * - Verde dual: forest profundo + lima só no CTA/accent
 */

export type AvantLogoSizeToken = 'nav' | 'md' | 'lg';

export const AVANT_LOGO_SIZE_SCALE: Record<AvantLogoSizeToken, number> = {
  nav: 0.72,
  md: 0.86,
  lg: 1,
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

export const AVANT_LOGO_COLORS = {
  iconForest: '#166534',
  iconForestDeep: '#14532d',
  /** Gradiente vertical sutil — profundidade tipo foil, sem candy. */
  iconForestGradient: 'linear-gradient(165deg, #1a7a3e 0%, #166534 42%, #14532d 100%)',
  iconCyberBg: '#0d0d18',
  iconCyberRing: '#8fe020',
  /** Vidro do monograma Ae (tile) — verde lima forte da marca editorial. */
  iconGlassLime: '#8fe020',
  monogramFill: '#ffffff',
  /** Anel interno (emboss / selo). */
  iconInsetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.18)',
  iconOuterShadowEditorial: '0 1px 2px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(22, 101, 52, 0.12)',
  iconOuterShadowCyber: '0 0 0 1px rgba(143, 224, 32, 0.30)',
  lockupInnerBg: '#0d0d18',
  lockupInnerInsetShadow:
    'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.20)',
  accentBar: '#8fe020',
  accentBarGlow: 'rgba(143, 224, 32, 0.28)',
  wordmarkLight: '#0f172a',
  wordmarkEditorial: '#0f172a',
  wordmarkCyber: '#f8fafc',
  subtitleEditorial: '#64748b',
  subtitleLight: '#64748b',
  subtitleCyber: '#94a3b8',
  hairlineEditorial: 'rgba(22, 101, 52, 0.28)',
  hairlineCyber: 'rgba(143, 224, 32, 0.35)',
  wordmarkGlow: 'rgba(143, 224, 32, 0.18)',
  /** Brasao dourado/esmeralda (mesmo modelo do emblema) — "AVANT" metalizado dourado. */
  wordmarkGoldSolid: '#d4af37',
  /** "enf" em verde esmeralda vivo, tom sólido para e-mail (sem gradiente). */
  wordmarkEnfGreen: '#0b7a53',
  wordmarkEnfGreenDeep: '#054a33',
} as const;

export const AVANT_LOGO_GRADIENTS = {
  icon: AVANT_LOGO_COLORS.iconForestGradient,
  wordmark: 'linear-gradient(130deg, #ecfdf5 0%, #86efac 45%, #8fe020 100%)',
  wordmarkStops: ['#ecfdf5', '#86efac', '#8fe020'] as const,
  shellBorder:
    'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(143, 224, 32, 0.35) 50%, rgba(22, 101, 52, 0.45) 100%)',
  /** Texto "AVANT" metalizado — mesmo brasao dourado do emblema (foil gradient). */
  wordmarkGoldText:
    'linear-gradient(135deg, #fbe9ac 0%, #e9c460 22%, #d4af37 45%, #a9791a 62%, #f2d478 80%, #d4af37 100%)',
  /** Verde esmeralda de "enf" — combina com o fundo do brasao. */
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

/** Wordmark raster PNG — proporção do arquivo em public/brand (com espaço real AVANT · enf). */
export const AVANT_LOGO_WORDMARK_RASTER = {
  /** Altura relativa ao fontSize base (1.5 ≈ legível sem estourar sidebar 16rem). */
  scale: 1.5,
  aspect: 1488 / 279,
} as const;

/** Glass Ae monogram — escala interna para sombra/bevel não clipar no lockup. */
export const AVANT_LOGO_ICON_INSET_SCALE = 0.9;

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
  rest: '0 0 0 1px rgba(143, 224, 32, 0.20), 0 4px 20px rgba(0, 0, 0, 0.35)',
  peak: '0 0 0 1px rgba(143, 224, 32, 0.40), 0 4px 28px rgba(143, 224, 32, 0.12)',
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
