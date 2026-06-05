/**
 * Layout mobile do dashboard: BottomNav no flex shell + faixas opcionais.
 * O `<main>` do DashboardShell é a única área de scroll; o BottomNav fica fora (shrink-0).
 *
 * Tokens deste arquivo: padding de conteúdo, scroll-margin, z-index e offsets
 * para elementos fixed acima do slot do BottomNav (ex.: banner PWA).
 *
 * IMPORTANTE: manter classes literais (Tailwind JIT não vê template strings).
 */

/** Altura nominal do BottomNav no flex shell (~5rem incl. labels). */
export const MOBILE_BOTTOM_NAV_HEIGHT = '5rem';

/** Aliases semânticos da altura do BottomNav (CSS var `--bottom-nav-height`). */
export const BOTTOM_NAV_HEIGHT_REM = 5;
export const BOTTOM_NAV_HEIGHT_PX = 80;
export const BOTTOM_NAV_HEIGHT_CSS = '5rem';

/**
 * Padding inferior do `<main>` rolável no dashboard mobile (BottomNav + safe area).
 * Classe literal para Tailwind JIT — usar no DashboardShell.
 */
export const MOBILE_MAIN_SCROLL_PADDING = 'pb-nav-safe';

/** Offset `bottom` para elementos `fixed` acima do slot do BottomNav + safe area. */
export const MOBILE_BOTTOM_NAV_FIXED_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Offset `bottom` dos toasts no mobile (acima do BottomNav + safe area). */
export const MOBILE_TOAST_FIXED_BOTTOM =
  'max-md:bottom-[calc(1.5rem+5rem+env(safe-area-inset-bottom,0px))]';

/** z-index do BottomNav fixo no flex shell. */
export const MOBILE_BOTTOM_NAV_Z = 'z-40';

/** BottomNav no viewport (portal no body) — fora de transforms do shell. */
export const MOBILE_BOTTOM_NAV_FIXED =
  'fixed bottom-0 left-0 right-0 md:hidden';

/** z-index legado para faixas fixed acima do nav (simulado mobile action bar). */
export const MOBILE_ACTION_BAR_Z = 'z-50';

/** Largura da sidebar fixa do dashboard (desktop ≥ md). */
export const DASHBOARD_SIDEBAR_WIDTH = '18rem';

/** Estudo reverso no celular: não cobre o BottomNav (Menu, Estudar, …). */
export const ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM =
  'max-md:bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Estudo reverso no desktop: não cobre a sidebar esquerda. */
export const ESTUDO_REVERSO_DESKTOP_INSET = 'md:inset-y-0 md:right-0 md:left-[18rem] md:bottom-0';

/** Estudo reverso imersivo — acima do modal de questão (z-100); abaixo do drawer quando aberto. */
export const ESTUDO_REVERSO_FULLSCREEN_Z = 'z-[110]';

/** Overlay escuro do drawer mobile (`DashboardShell`). */
export const MOBILE_DRAWER_OVERLAY_Z = 'z-[65]';

/** Painel do drawer mobile. */
export const MOBILE_DRAWER_PANEL_Z = 'z-[70]';

/** Drawer acima do modal de questão / estudo reverso (usuário abre Menu com overlay ativo). */
export const MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z = 'z-[115]';

export const MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z = 'z-[120]';

/**
 * Padding no conteúdo quando o banner PWA flutua sobre a parte inferior do main
 * (acima do BottomNav no flex shell). Soma só o banner — nav já está no `MOBILE_MAIN_SCROLL_PADDING`.
 */
export const MOBILE_PAGE_PWA_BANNER_PADDING =
  'pb-[calc(6rem+0.5rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated Use MOBILE_PAGE_PWA_BANNER_PADDING */
export const MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA = MOBILE_PAGE_PWA_BANNER_PADDING;

/** scrollIntoView: folga visual no fim do main. */
export const MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM = 'scroll-mb-4';

/** Sticky acima do BottomNav + safe area + 1rem de folga (substitui `bottom-4`). */
export const MOBILE_STICKY_ABOVE_NAV_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+1rem)]';

/** Folga entre a barra sticky de paginação e o topo do BottomNav (`MOBILE_STICKY_ABOVE_NAV_BOTTOM`). */
export const MOBILE_VITRINE_STICKY_PAGINATION_GAP = '1rem';

/** Altura nominal da barra sticky (botões 44px + rótulo + py; pb-safe fica dentro do fixed). */
export const MOBILE_VITRINE_STICKY_PAGINATION_BAR_HEIGHT = '6.75rem';

/**
 * Reserva na grade mobile: gap acima do nav + barra sticky.
 * Safe area do home indicator já vem de `pb-nav-safe` no `<main>` — não somar de novo aqui.
 */
export const MOBILE_VITRINE_STICKY_PAGINATION_CLEARANCE =
  'calc(1rem + 6.75rem)';

/**
 * Padding inferior na grade da vitrine mobile (barra sticky Anterior/Próxima).
 * Classe literal para Tailwind JIT — usar com `max-md:` no wrapper da lista.
 */
export const MOBILE_VITRINE_STICKY_PAGINATION_PADDING = 'pb-vitrine-sticky-pagination';

/** Atalho mobile-only para o wrapper da grade + paginação inline da vitrine. */
export const MOBILE_VITRINE_GRID_STICKY_PAGINATION_PADDING =
  'pb-vitrine-sticky-pagination md:pb-0';

/**
 * Altura reservada do banner PWA fixo (`PwaInstallPanel` + margens).
 * Medido ~6rem; posicionado com MOBILE_BOTTOM_NAV_FIXED_BOTTOM.
 */
export const MOBILE_PWA_INSTALL_BANNER_CLEARANCE = '6rem';

export type DashboardPageBottomPaddingVariant = 'default' | 'actionBar' | 'vitrinePagination';

/**
 * Padding inferior opcional no conteúdo das páginas (dentro do main rolável).
 * Com flex shell, só o banner PWA exige reserva quando visível.
 */
export function getDashboardPageBottomPadding(
  _variant: DashboardPageBottomPaddingVariant,
  pwaVisible: boolean,
): string | undefined {
  if (!pwaVisible) return undefined;
  return MOBILE_PAGE_PWA_BANNER_PADDING;
}

