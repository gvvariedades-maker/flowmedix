import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';

/**
 * Acento editorial da vitrine = print `EDITORIAL_BRAND` / tokens CSS.
 * Classes consomem `var(--color-*)` — fonte única com `globals.css`.
 * Success/warning ficam semânticos; não usar verde legado.
 */
export const VITRINE_BRAND_HEX = EDITORIAL_BRAND.hex;

/** Classes Tailwind estáticas via tokens CSS (`:root` / `html[data-theme='editorial']`). */
export const vitrineBrand = {
  text: 'text-[var(--color-brand-text)]',
  bg: 'bg-[var(--color-brand)]',
  borderL: 'border-l-[var(--color-brand)]',
  bar: 'bg-[var(--color-brand)]',
  selection: 'selection:bg-[var(--color-brand-dim)]',
  selectionText: 'selection:text-[var(--color-text-primary)]',
  hoverText: 'hover:text-[var(--color-brand)]',
  hoverBg: 'hover:bg-[var(--color-brand-dim)]',
  hoverBorder: 'hover:border-[var(--color-card-border-hover)]',
  hoverBgLight: 'hover:bg-[var(--color-brand-wash)]',
  hoverBorderLight: 'hover:border-[var(--color-card-border-hover)]',
  hoverBgDim: 'hover:bg-[var(--color-brand-wash)]',
  groupHoverBorder: 'group-hover:border-[var(--color-card-border-hover)]',
  groupHoverBg: 'group-hover:bg-[var(--color-brand-dim)]',
  groupHoverText: 'group-hover:text-[var(--color-brand)]',
  groupHoverIconBorder: 'group-hover:border-[var(--color-card-border)]',
  icon: 'text-[var(--color-brand)]',
  tintBg: 'bg-[var(--color-brand-dim)]',
  tintBorder: 'border-[var(--color-card-border)]',
  selectedBorder: 'border-[var(--color-card-border-hover)]',
  selectedIcon:
    'border-[var(--color-card-border-hover)] bg-[var(--color-brand-dim)] text-[var(--color-brand)]',
  focusRing: 'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)]',
  focusRingOffset:
    'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)] focus-visible:ring-offset-2',
  buttonPrimary:
    'rounded-[var(--radius-card)] bg-gradient-to-b from-[var(--color-brand-cta-top)] via-[var(--color-brand-cta-mid)] to-[var(--color-brand-cta-bottom)] text-white shadow-[var(--shadow-brand-cta)] transition-[filter,box-shadow] hover:from-[var(--color-brand-cta-hover-top)] hover:via-[var(--color-brand-cta-hover-mid)] hover:to-[var(--color-brand-cta-hover-bottom)] hover:shadow-[var(--shadow-brand-cta-hover)] disabled:cursor-not-allowed disabled:opacity-70',
  /**
   * CTA primário sólido — banner único acima da dobra (resume / diagnóstico / missão).
   * Classe canônica em `globals.css` (sem gradiente, sem uppercase).
   */
  buttonPrimarySolid: 'btn-editorial-primary-solid',
  /**
   * CTA secundário — cards de assunto / sheet / disciplina (máx. 1 solid acima da dobra).
   */
  buttonSecondary: 'btn-editorial-secondary',
  /** @deprecated Preferir `buttonSecondary` nos cards de assunto. */
  buttonPrimarySm: 'btn-editorial-secondary w-full text-sm',
  /** Superfície de card — classe canônica (borda/sombra via tokens). */
  cardSurface: 'card-elevated',
  filterChipActive:
    'inline-flex min-h-[44px] shrink-0 items-center rounded-[var(--radius-pill)] border border-[var(--color-brand-ring)] bg-gradient-to-b from-[var(--color-brand-cta-top)] via-[var(--color-brand-cta-mid)] to-[var(--color-brand-cta-bottom)] text-xs font-semibold text-white shadow-[var(--shadow-brand-cta)] md:min-h-9',
  filterChipDot: 'bg-white',
  filterChipClearHover: 'hover:brightness-95',
} as const;
