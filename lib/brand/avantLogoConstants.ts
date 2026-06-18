/**
 * AVANT logo — cores, dimensões base e tokens de escala.
 * Fonte única para AvantLogo, PWA (public/brand/avant-pwa-icon.png) e e-mail estático.
 */

export type AvantLogoSizeToken = 'nav' | 'md' | 'lg';

/** Escala por contexto: nav ≈ 72% (header compacto), lg = 100% (auth/cards). */
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

/** Letter-spacing do wordmark por contexto (px na escala lg). */
export const AVANT_LOGO_WORDMARK_LETTER_SPACING: Record<AvantLogoSizeToken, number> = {
  nav: 5,
  md: 7,
  lg: 9,
} as const;

export function getAvantLogoWordmarkLetterSpacing(size: AvantLogoSizeToken): number {
  const base = AVANT_LOGO_WORDMARK_LETTER_SPACING[size];
  return Math.round(base * getAvantLogoScale(size));
}

export const AVANT_LOGO_COLORS = {
  iconGradientHighlight: '#4ade80',
  iconGradientStart: '#22c55e',
  iconGradientEnd: '#15803d',
  /** Sheen superior do chip — faixa fina (~18% altura). */
  iconSheen: 'rgba(255,255,255,0.30)',
  iconSheenHeightRatio: 0.18,
  iconInsetHighlight: 'rgba(255,255,255,0.35)',
  iconInsetShadow: 'rgba(0,0,0,0.25)',
  iconOuterShadow:
    '0 4px 16px rgba(34, 197, 94, 0.45), 0 2px 6px rgba(0, 0, 0, 0.15)',
  iconLetterShadow: '0 1px 0 rgba(0,0,0,0.35), 0 -1px 0 rgba(255,255,255,0.15)',
  /** Deslocamento óptico do «A» (cap height parece alta demais no centro geométrico). */
  iconLetterOffsetY: -1,
  lockupInnerBg: '#0d0d18',
  lockupInnerInsetShadow:
    'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.20)',
  accentBar: '#22c55e',
  accentBarGlow: 'rgba(34, 197, 94, 0.55)',
  wordmarkGlow: 'rgba(74, 222, 128, 0.40)',
  /** Editorial v2 — wordmark em fundo claro (auth / headers públicos) */
  wordmarkLight: '#0f172a',
  /** Editorial v2 — wordmark no dashboard (sidebar, alinhado ao chip verde) */
  wordmarkEditorial: '#166534',
} as const;

export const AVANT_LOGO_GRADIENTS = {
  icon: `linear-gradient(160deg, ${AVANT_LOGO_COLORS.iconGradientHighlight} 0%, ${AVANT_LOGO_COLORS.iconGradientStart} 40%, ${AVANT_LOGO_COLORS.iconGradientEnd} 100%)`,
  wordmark: 'linear-gradient(130deg, #a7f3d0 0%, #22c55e 50%, #4ade80 100%)',
  wordmarkStops: ['#a7f3d0', '#22c55e', '#4ade80'] as const,
  shellBorder:
    'linear-gradient(160deg, rgba(255,255,255,0.25) 0%, rgba(34, 197, 94, 0.60) 50%, rgba(22, 163, 74, 0.40) 100%)',
} as const;

/** Dimensões em px na escala 1 (lg). Aplicar `scaleAvantLogoPx` por `size`. */
export const AVANT_LOGO_DIMENSIONS = {
  icon: {
    size: 56,
    radius: 14,
  },
  lockupInner: {
    radius: 16,
    paddingTop: 14,
    paddingRight: 36,
    paddingBottom: 14,
    paddingLeft: 14,
    accentBarWidth: 4,
    gap: 12,
  },
  lockupShell: {
    radius: 18,
    padding: 2,
  },
  wordmark: {
    fontSize: 26,
    /** Base legado; preferir AVANT_LOGO_WORDMARK_LETTER_SPACING por size. */
    letterSpacingPx: 9,
    fontWeight: 800,
    lineHeight: 1,
  },
} as const;

/**
 * Sombras do shell externo (lockup).
 * Manter em sync com `@keyframes avantLogoPulse` em app/globals.css.
 * Halo verde bicromo: camada próxima intensa + camada difusa suave.
 */
export const AVANT_LOGO_SHELL_SHADOW = {
  rest: '0 0 14px rgba(34, 197, 94, 0.22), 0 0 32px rgba(74, 222, 128, 0.10)',
  peak: '0 0 22px rgba(34, 197, 94, 0.50), 0 0 48px rgba(74, 222, 128, 0.20)',
} as const;

export const AVANT_LOGO_ANIMATION = {
  pulseKeyframes: 'avantLogoPulse',
  pulseClassName: 'avant-logo-pulse',
  pulseDuration: '4s',
  pulseTiming: 'cubic-bezier(0.4, 0, 0.6, 1)',
  pulseIteration: 'infinite',
} as const;

/** Variável CSS Plus Jakarta Sans (definida em app/layout.tsx). */
export const AVANT_LOGO_FONT_FAMILY =
  'var(--font-plus-jakarta-sans, "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif)';

/** Padding do lockup interno como string CSS (escala 1). */
export function getAvantLogoLockupPadding(size: AvantLogoSizeToken = 'lg'): string {
  const s = getAvantLogoScale(size);
  const d = AVANT_LOGO_DIMENSIONS.lockupInner;
  const t = scaleAvantLogoPx(d.paddingTop, size);
  const r = Math.round(d.paddingRight * s);
  const b = scaleAvantLogoPx(d.paddingBottom, size);
  const l = scaleAvantLogoPx(d.paddingLeft, size);
  return `${t}px ${r}px ${b}px ${l}px`;
}
