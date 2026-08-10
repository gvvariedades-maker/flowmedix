/**
 * Contraste WCAG 2.2 AA dos tokens editoriais (pares do plano Editorial Premium).
 * Helper local — sem lib nova de contraste.
 */

type Rgb = { r: number; g: number; b: number };

/** Tokens canônicos espelhados de `html[data-theme='editorial']` em globals.css */
const EDITORIAL_TOKENS = {
  canvas: '#FFF1E0', // --color-surface-0
  white: '#FFFFFF', // --color-surface-2 / texto on CTA
  brandText: '#9A3412', // --color-brand-text
  textSecondary: '#475569', // --color-text-secondary
  ctaSolid: '#C2410C', // --color-brand-cta-solid
  /** --color-brand-dim = rgba(242,101,34,0.12) */
  brandDim: { r: 242, g: 101, b: 34, a: 0.12 },
} as const;

const WCAG_AA_NORMAL_TEXT = 4.5;

function parseHex(hex: string): Rgb {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

function contrastRatio(fg: Rgb, bg: Rgb): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Composita rgba sobre fundo opaco (ex.: tint brand-dim sobre canvas). */
function compositeOver(
  fg: { r: number; g: number; b: number; a: number },
  bg: Rgb,
): Rgb {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

describe('Editorial contrast tokens (WCAG AA)', () => {
  it('branco × CTA sólido (--color-brand-cta-solid) ≥ 4.5:1', () => {
    const ratio = contrastRatio(
      parseHex(EDITORIAL_TOKENS.white),
      parseHex(EDITORIAL_TOKENS.ctaSolid),
    );
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('--color-brand-text × branco ≥ 4.5:1', () => {
    const ratio = contrastRatio(
      parseHex(EDITORIAL_TOKENS.brandText),
      parseHex(EDITORIAL_TOKENS.white),
    );
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('secundário (--color-text-secondary) × canvas (--color-surface-0) ≥ 4.5:1', () => {
    const ratio = contrastRatio(
      parseHex(EDITORIAL_TOKENS.textSecondary),
      parseHex(EDITORIAL_TOKENS.canvas),
    );
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('secundário × tint (brand-dim sobre canvas) ≥ 4.5:1', () => {
    const tint = compositeOver(
      EDITORIAL_TOKENS.brandDim,
      parseHex(EDITORIAL_TOKENS.canvas),
    );
    const ratio = contrastRatio(parseHex(EDITORIAL_TOKENS.textSecondary), tint);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
