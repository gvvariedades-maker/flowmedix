import { AVANT_LOGO_COLORS } from '@/lib/brand/avantLogoConstants';

/**
 * Verde do squircle do ícone AVANT (`iconCardGreen`).
 * Único acento editorial na vitrine — não usar `#22c55e` / `#8fe020` aqui.
 */
export const VITRINE_BRAND_HEX = AVANT_LOGO_COLORS.iconCardGreen;

/** Classes Tailwind estáticas (hex = `VITRINE_BRAND_HEX`). */
export const vitrineBrand = {
  text: 'text-[#0cc93a]',
  bg: 'bg-[#0cc93a]',
  borderL: 'border-l-[#0cc93a]',
  bar: 'bg-[#0cc93a]',
  selection: 'selection:bg-[#0cc93a]/20',
  hoverText: 'hover:text-[#0cc93a]',
  hoverBg: 'hover:bg-[rgba(12,201,58,0.08)]',
  hoverBorder: 'hover:border-[rgba(12,201,58,0.35)]',
  hoverBgLight: 'hover:bg-[rgba(12,201,58,0.06)]',
  hoverBorderLight: 'hover:border-[rgba(12,201,58,0.3)]',
  hoverBgDim: 'hover:bg-[rgba(12,201,58,0.04)]',
  groupHoverBorder: 'group-hover:border-[rgba(12,201,58,0.35)]',
  groupHoverBg: 'group-hover:bg-[rgba(12,201,58,0.08)]',
  icon: 'text-[#0cc93a]',
  tintBg: 'bg-[rgba(12,201,58,0.08)]',
  tintBorder: 'border-[rgba(12,201,58,0.22)]',
  buttonPrimary:
    'bg-[#0cc93a] text-[#1a2e05] shadow-sm transition-colors hover:bg-[#0ab532] disabled:cursor-not-allowed disabled:opacity-70',
  filterChipActive:
    'inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[rgba(12,201,58,0.35)] bg-[rgba(12,201,58,0.08)] text-xs font-medium text-[#0cc93a] md:min-h-9',
  filterChipDot: 'bg-[#0cc93a]',
  filterChipClearHover: 'hover:bg-[rgba(12,201,58,0.2)]',
} as const;
