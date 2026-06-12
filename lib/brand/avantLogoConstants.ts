/**
 * AVANT logo — cores, geometria do raio, dimensões base e tokens de escala.
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

/** Geometria do raio (viewBox 38×42). Usar em SVG `points` ou clip-path equivalente. */
export const AVANT_LOGO_BOLT = {
  polygon: '22,0 8,20 15,20 10,42 30,16 18,16',
  viewBox: '0 0 38 42',
  width: 38,
  height: 42,
} as const;

export const AVANT_LOGO_COLORS = {
  iconGradientStart: '#8fe020',
  iconGradientEnd: '#58b800',
  iconSheen: 'rgba(255,255,255,0.18)',
  boltHighlight: 'rgba(255,255,255,0.15)',
  lockupInnerBg: '#0d0d18',
  accentBar: '#8fe020',
  accentBarGlow: 'rgba(143, 224, 32, 0.55)',
  wordmarkGlow: 'rgba(192, 240, 64, 0.35)',
  /** Editorial v2 — wordmark em fundo claro (#f8fafc), sem chip escuro */
  wordmarkLight: '#0f172a',
} as const;

export const AVANT_LOGO_GRADIENTS = {
  icon: `linear-gradient(145deg, ${AVANT_LOGO_COLORS.iconGradientStart}, ${AVANT_LOGO_COLORS.iconGradientEnd})`,
  bolt: 'linear-gradient(180deg, #d8ff70 0%, #8fe020 52%, #58b800 100%)',
  boltStops: ['#d8ff70', '#8fe020', '#58b800'] as const,
  wordmark: 'linear-gradient(90deg, #d8ff70 0%, #8fe020 48%, #c0f040 100%)',
  wordmarkStops: ['#d8ff70', '#8fe020', '#c0f040'] as const,
  shellBorder:
    'linear-gradient(145deg, rgba(143, 224, 32, 0.65) 0%, rgba(88, 184, 0, 0.55) 100%)',
} as const;

/** Dimensões em px na escala 1 (lg). Aplicar `scaleAvantLogoPx` por `size`. */
export const AVANT_LOGO_DIMENSIONS = {
  icon: {
    size: 56,
    radius: 14,
    boltInsetRatio: 0.5,
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
    letterSpacingPx: 7,
    fontWeight: 800,
    lineHeight: 1,
  },
} as const;

/**
 * Sombras do shell externo (lockup).
 * Manter em sync com `@keyframes avantLogoPulse` em app/globals.css.
 */
export const AVANT_LOGO_SHELL_SHADOW = {
  rest: '0 0 14px rgba(143, 224, 32, 0.22), 0 0 28px rgba(48, 24, 200, 0.18)',
  peak: '0 0 22px rgba(143, 224, 32, 0.48), 0 0 44px rgba(48, 24, 200, 0.32)',
} as const;

export const AVANT_LOGO_ANIMATION = {
  pulseKeyframes: 'avantLogoPulse',
  pulseClassName: 'avant-logo-pulse',
  pulseDuration: '5s',
  pulseTiming: 'ease-in-out',
  pulseIteration: 'infinite',
} as const;

/** Variável CSS Syne (definida em app/layout.tsx). */
export const AVANT_LOGO_FONT_FAMILY = 'var(--font-syne, Syne, ui-sans-serif, system-ui, sans-serif)';

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
