/**
 * Layout mobile do dashboard: shell flex 100dvh com três faixas.
 * - Header mobile: shrink-0
 * - `<main>`: flex-1 overflow-y-auto (única área de scroll)
 * - BottomNav: shrink-0 no flex (não fixed)
 *
 * Tokens: scroll-margin, z-index e offsets para overlays fixed acima do nav (PWA, drawer, toasts).
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
 * @deprecated Nav ocupa slot no flex shell — não aplicar padding de nav no `<main>`.
 * Mantido para utilitário CSS `pb-nav-safe` e testes de regressão.
 */
export const MOBILE_MAIN_SCROLL_PADDING = 'pb-nav-safe';

/** BottomNav inline no flex shell do DashboardShell (shrink-0, não fixed). */
export const MOBILE_BOTTOM_NAV_SHELL = 'shrink-0 w-full md:hidden';

/** Offset `bottom` para elementos `fixed` acima do slot do BottomNav + safe area. */
export const MOBILE_BOTTOM_NAV_FIXED_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Offset `bottom` dos toasts no mobile (acima do BottomNav + safe area). */
export const MOBILE_TOAST_FIXED_BOTTOM =
  'max-md:bottom-[calc(1.5rem+5rem+env(safe-area-inset-bottom,0px))]';

/** z-index do BottomNav no flex shell. */
export const MOBILE_BOTTOM_NAV_Z = 'z-40';

/** Raiz de página dentro do `<main>` rolável — preenche coluna sem forçar 100vh. */
export const DASHBOARD_PAGE_ROOT = 'min-h-0 flex-1';

/** Estados vazios/erro centralizados na área visível do main (não 100vh). */
export const DASHBOARD_PAGE_CENTER = 'flex min-h-full items-center justify-center';

/** z-index legado para faixas fixed acima do nav (simulado mobile action bar). */
export const MOBILE_ACTION_BAR_Z = 'z-50';

/** Largura da sidebar fixa do dashboard (desktop ≥ md). */
export const DASHBOARD_SIDEBAR_WIDTH = '16rem';

/** Estudo reverso no celular: não cobre o BottomNav (Menu, Estudar, …). */
export const ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM =
  'max-md:bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Estudo reverso imersivo (questão inline): BottomNav oculto — base da tela no mobile. */
export const ESTUDO_REVERSO_MOBILE_FIXED_BOTTOM_IMMERSIVE = 'max-md:bottom-0';

/** Estudo reverso no desktop: viewport inteiro (`z-[110]` cobre a sidebar `z-20`). */
export const ESTUDO_REVERSO_DESKTOP_INSET = 'md:inset-0';

/** Estudo reverso imersivo — acima do modal de questão (z-100); abaixo do drawer quando aberto. */
export const ESTUDO_REVERSO_FULLSCREEN_Z = 'z-[110]';

/** Overlay escuro do drawer mobile (`DashboardShell`). */
export const MOBILE_DRAWER_OVERLAY_Z = 'z-[65]';

/** Painel do drawer mobile. */
export const MOBILE_DRAWER_PANEL_Z = 'z-[70]';

/** Drawer acima do modal de questão / estudo reverso (usuário abre Menu com overlay ativo). */
export const MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z = 'z-[115]';

export const MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z = 'z-[120]';

/** Popover Aa (zoom de texto) — acima de modal de questão (100), ER (110) e drawer (120). */
export const READABLE_TEXT_ZOOM_POPOVER_Z = 'z-[125]';

/**
 * Padding no conteúdo quando o banner PWA flutua sobre a parte inferior do main
 * (acima do BottomNav no flex shell). Soma só o banner — nav já ocupa slot shrink-0.
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

