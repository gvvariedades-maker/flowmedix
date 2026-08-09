import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';

/**
 * Acento editorial da vitrine = print `#F26522` (`EDITORIAL_BRAND`).
 * Único acento de marca aqui — success/warning ficam semânticos; não usar verde legado.
 */
export const VITRINE_BRAND_HEX = EDITORIAL_BRAND.hex;

/** Classes Tailwind estáticas (hex = `VITRINE_BRAND_HEX` / `EDITORIAL_BRAND`). */
export const vitrineBrand = {
  text: 'text-[#F26522]',
  bg: 'bg-[#F26522]',
  borderL: 'border-l-[#F26522]',
  bar: 'bg-[#F26522]',
  selection: 'selection:bg-[#F26522]/20',
  selectionText: 'selection:text-[#0F172A]',
  hoverText: 'hover:text-[#F26522]',
  hoverBg: 'hover:bg-[rgba(242,101,34,0.08)]',
  hoverBorder: 'hover:border-[rgba(242,101,34,0.35)]',
  hoverBgLight: 'hover:bg-[rgba(242,101,34,0.06)]',
  hoverBorderLight: 'hover:border-[rgba(242,101,34,0.3)]',
  hoverBgDim: 'hover:bg-[rgba(242,101,34,0.04)]',
  groupHoverBorder: 'group-hover:border-[rgba(242,101,34,0.35)]',
  groupHoverBg: 'group-hover:bg-[rgba(242,101,34,0.08)]',
  groupHoverText: 'group-hover:text-[#F26522]',
  groupHoverIconBorder: 'group-hover:border-[rgba(242,101,34,0.25)]',
  icon: 'text-[#F26522]',
  tintBg: 'bg-[rgba(242,101,34,0.08)]',
  tintBorder: 'border-[rgba(242,101,34,0.22)]',
  selectedBorder: 'border-[rgba(242,101,34,0.35)]',
  selectedIcon:
    'border-[rgba(242,101,34,0.35)] bg-[rgba(242,101,34,0.1)] text-[#F26522]',
  focusRing: 'focus-visible:ring-2 focus-visible:ring-[#F26522]/40',
  focusRingOffset:
    'focus-visible:ring-2 focus-visible:ring-[#F26522]/40 focus-visible:ring-offset-2',
  buttonPrimary:
    'bg-[#F26522] text-[#0F172A] shadow-sm transition-colors hover:bg-[#E05518] disabled:cursor-not-allowed disabled:opacity-70',
  filterChipActive:
    'inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[rgba(242,101,34,0.35)] bg-[rgba(242,101,34,0.08)] text-xs font-medium text-[#F26522] md:min-h-9',
  filterChipDot: 'bg-[#F26522]',
  filterChipClearHover: 'hover:bg-[rgba(242,101,34,0.2)]',
} as const;
