/**
 * AVANT Editorial — tokens de marca V2.1 (Golden Master).
 *
 * Valores canônicos: `lib/brand/tokens/color-tokens.json` · `color-tokens.css`
 *
 * Não confundir com:
 * - Cyber `:root` `#00f2ff` — NeuroSlides / tema escuro
 * - `--color-success` / `--color-warning` — semântica de acerto e risco
 */

export const EDITORIAL_BRAND = {
  /** Brand Orange — institucional (logo, acentos de marca). */
  hex: '#F45A1F',
  /** Orange Dark — hover + CTA primário acessível com texto branco (AA). */
  hover: '#B83A0B',
  textOnBrand: '#FFFFFF',
  textOnLight: '#B83A0B',
  /** Legível sobre slate escuro (`[data-surface='focus']`). */
  textOnDark: '#FDBA74',
  dim: 'rgba(244, 90, 31, 0.12)',
  dimNav: 'rgba(244, 90, 31, 0.1)',
  dimFocus: 'rgba(244, 90, 31, 0.14)',
  glow: 'rgba(244, 90, 31, 0.22)',
  washBg: '#FFF8EF',
  /** CTA sólido acessível — Orange Dark + texto branco. */
  ctaSolid: '#B83A0B',
  ctaSolidHover: '#9A2F09',
  deepNavy: '#0E1D2D',
  /** ≈ Brand Orange para `--ring` shadcn. */
  ringHsl: '17 91% 54%',
} as const;

export type EditorialBrand = typeof EDITORIAL_BRAND;
