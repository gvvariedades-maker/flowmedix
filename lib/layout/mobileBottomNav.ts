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

/** Offset `bottom` para elementos `fixed` acima do slot do BottomNav + safe area. */
export const MOBILE_BOTTOM_NAV_FIXED_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated Faixa fixa legada; preferir ação inline no fluxo do main. */
export const MOBILE_ACTION_BAR_SPACER = 'h-[5.25rem]';

/** @deprecated Spacer legado (nav + faixa fixa); shell flex não usa. */
export const MOBILE_ACTION_BAR_STACK_SPACER =
  'h-[calc(5rem+1.25rem+5.25rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated Spacer legado com banner PWA. */
export const MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA =
  'h-[calc(5rem+1.25rem+5.25rem+6rem+env(safe-area-inset-bottom,0px))]';

/** z-index do BottomNav fixo no flex shell. */
export const MOBILE_BOTTOM_NAV_Z = 'z-40';

/** z-index legado para faixas fixed acima do nav. */
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
 * @deprecated BottomNav está fora do scroll — shell não aplica padding de nav no main.
 * Mantido vazio para compatibilidade de imports.
 */
export const MOBILE_PAGE_BOTTOM_PADDING = 'pb-0';

/**
 * Padding no conteúdo quando o banner PWA flutua sobre a parte inferior do main
 * (acima do BottomNav no flex shell).
 */
export const MOBILE_PAGE_PWA_BANNER_PADDING =
  'pb-[calc(6rem+0.5rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated Use MOBILE_PAGE_PWA_BANNER_PADDING; nav não entra mais no cálculo. */
export const MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA = MOBILE_PAGE_PWA_BANNER_PADDING;

/** Nav (5rem) + gap da faixa (1.25rem) + altura da faixa (5.25rem) + safe area. */
export const MOBILE_PAGE_ACTION_BAR_STACK_PADDING =
  'pb-[calc(5rem+1.25rem+5.25rem+env(safe-area-inset-bottom,0px))]';

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

/** @deprecated Shell flex: nav fora do scroll. */
export const MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA =
  'pb-[calc(5rem+1.25rem+5.25rem+6rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated Paginação vitrine inline no fluxo. */
export const MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM =
  'bottom-[calc(5rem+0.75rem+env(safe-area-inset-bottom,0px))]';

/** @deprecated */
export const MOBILE_VITRINE_PAGINATION_SPACER = 'h-[8.5rem]';

/** @deprecated */
export const MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING =
  'pb-[calc(5rem+0.75rem+7.5rem+1rem+env(safe-area-inset-bottom,0px))]';

export const MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING_WITH_PWA =
  'pb-[calc(5rem+0.75rem+7.5rem+1rem+6rem+env(safe-area-inset-bottom,0px))]';

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
