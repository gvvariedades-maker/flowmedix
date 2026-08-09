/**
 * AVANT Editorial — acento de marca (CTA / nav / focus ring).
 *
 * Hex canônico do print “SERINGA de Insulina”. Fonte única para tokens CSS
 * (`globals.css`) e classes Tailwind que exigem literais estáticos.
 *
 * Não confundir com:
 * - `AVANT_LOGO_COLORS.brandBlue*` — metal cobre do wordmark/monograma
 * - `AVANT_LOGO_COLORS.iconCardBrand` / anéis do lockup — mesmos hex, papéis
 *   de asset (squircle/PNG); ver `docs/REBRAND_LOGO_ASSETS_CHECKLIST.md`
 * - Cyber `:root` `#00f2ff` — NeuroSlides / tema escuro
 * - `--color-success` / `--color-warning` — semântica de acerto e risco
 */

export const EDITORIAL_BRAND = {
  hex: '#F26522',
  hover: '#E05518',
  textOnBrand: '#0F172A',
  textOnLight: '#9A3412',
  /** Legível sobre slate escuro (`[data-surface='focus']`). */
  textOnDark: '#FDBA74',
  dim: 'rgba(242, 101, 34, 0.12)',
  dimNav: 'rgba(242, 101, 34, 0.1)',
  dimFocus: 'rgba(242, 101, 34, 0.14)',
  glow: 'rgba(242, 101, 34, 0.22)',
  washBg: '#FFF1E0',
  /** ≈ #F26522 para `--ring` shadcn. */
  ringHsl: '18 88% 54%',
} as const;

export type EditorialBrand = typeof EDITORIAL_BRAND;
