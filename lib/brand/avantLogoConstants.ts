/**
 * AVANT enf logo — identidade oficial "Brushed Blue" (adotada 2026-07-15).
 *
 * Direção de marca:
 * - Ícone: card squircle verde (`iconCardGreen`) + monograma "A" fragmentado
 *   em metal azul escovado (`brandBlue`) — ver `public/brand/avant-logo-shield.png`.
 * - Wordmark "AVANT": mesmo metal azul escovado do monograma (raster,
 *   `avant-logo-wordmark-raster.png`).
 * - Sufixo "enf": verde glass/neon, contraste com o azul do "AVANT".
 * - `brandBlue` é cor de marca oficial (3ª cor, ao lado do verde/lima e do
 *   cyan do tema Cyber Clinical) — usar `AVANT_LOGO_COLORS.brandBlue*` em
 *   qualquer novo ponto de UI que precise ecoar a marca (nunca hardcodear hex).
 * - Tracking aéreo no wordmark; "enf" em minúsculas sem bullet.
 */

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

export const AVANT_LOGO_COLORS = {
  iconForest: '#166534',
  iconForestDeep: '#14532d',
  /** Gradiente vertical sutil — profundidade tipo foil, sem candy. */
  iconForestGradient: 'linear-gradient(165deg, #1a7a3e 0%, #166534 42%, #14532d 100%)',
  iconCyberBg: '#0d0d18',
  iconCyberRing: '#8fe020',
  /** Card do monograma — verde neon do ícone (fundo do squircle). */
  iconCardGreen: '#0cc93a',
  monogramFill: '#ffffff',
  /**
   * Azul de marca oficial — metal escovado do monograma "A" e do wordmark
   * "AVANT" (`avant-logo-shield.png` / `avant-logo-wordmark-raster.png`).
   * Sampleado do asset: highlight ~#46aaf2, mid ~#48a3b4, sombra ~#033d4b.
   */
  brandBlue: '#2f9fe0',
  brandBlueLight: '#7dd3fc',
  brandBlueDeep: '#0b4a63',
  /** Anel interno (emboss / selo). */
  iconInsetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.18)',
  iconOuterShadowEditorial: '0 1px 2px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(22, 101, 52, 0.12)',
  iconOuterShadowCyber: '0 0 0 1px rgba(143, 224, 32, 0.30)',
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
  hairlineEditorial: 'rgba(22, 101, 52, 0.28)',
  hairlineCyber: 'rgba(143, 224, 32, 0.35)',
  wordmarkGlow: 'rgba(143, 224, 32, 0.18)',
  /** "AVANT" metal azul escovado (mesmo modelo do emblema) — tom sólido para e-mail. */
  wordmarkBrandBlueSolid: '#2f9fe0',
  /** "enf" em verde vivo, tom sólido para e-mail (sem gradiente). */
  wordmarkEnfGreen: '#0b7a53',
  wordmarkEnfGreenDeep: '#054a33',
} as const;

export const AVANT_LOGO_GRADIENTS = {
  icon: AVANT_LOGO_COLORS.iconForestGradient,
  wordmark: 'linear-gradient(130deg, #ecfdf5 0%, #86efac 45%, #8fe020 100%)',
  wordmarkStops: ['#ecfdf5', '#86efac', '#8fe020'] as const,
  shellBorder:
    'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(143, 224, 32, 0.35) 50%, rgba(22, 101, 52, 0.45) 100%)',
  /** Texto "AVANT" metalizado — mesmo metal azul escovado do emblema (foil gradient). */
  wordmarkBrandGradient:
    'linear-gradient(135deg, #bfe6fb 0%, #7dd3fc 22%, #2f9fe0 45%, #0b4a63 62%, #46aaf2 80%, #2f9fe0 100%)',
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
