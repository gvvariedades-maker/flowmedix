/**
 * Layout mobile do dashboard: BottomNav fixo (DashboardShell) + faixas de ação.
 * Usar as mesmas constantes em vitrine/simulados para alinhar offset e z-index.
 *
 * Tokens deste arquivo são para **conteúdo** (padding, scroll-margin, sticky).
 * Offsets `bottom-[calc(...)]` das barras fixas (BottomNav, paginação, faixa de
 * ação, PWA) não devem ser alterados neste contrato — ajuste só o scroll area.
 *
 * IMPORTANTE: manter classes literais (Tailwind JIT não vê template strings).
 */

/** Offset `bottom` para elementos `fixed` acima do BottomNav + safe area. */
export const MOBILE_BOTTOM_NAV_FIXED_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+1.25rem)]';

/** Reserva de scroll para faixa de ação (botão h-12 + py-3 + borda). */
export const MOBILE_ACTION_BAR_SPACER = 'h-[5.25rem]';

/**
 * Reserva no fluxo do documento: BottomNav + gap + faixa de ação + safe area.
 * Alinha com `MOBILE_PAGE_ACTION_BAR_STACK_PADDING` (altura equivalente).
 */
export const MOBILE_ACTION_BAR_STACK_SPACER =
  'h-[calc(5rem+1.25rem+5.25rem+env(safe-area-inset-bottom,0px))]';

/** Stack action bar + banner PWA visível + safe area. */
export const MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA =
  'h-[calc(5rem+1.25rem+5.25rem+6rem+env(safe-area-inset-bottom,0px))]';

/** z-index do BottomNav fixo. */
export const MOBILE_BOTTOM_NAV_Z = 'z-40';

/** z-index acima do BottomNav (`z-40`); abaixo do drawer mobile e modais. */
export const MOBILE_ACTION_BAR_Z = 'z-50';

/** Overlay escuro do drawer mobile (`DashboardShell`); acima da faixa de ação e do banner PWA. */
export const MOBILE_DRAWER_OVERLAY_Z = 'z-[65]';

/** Painel do drawer mobile; acima do overlay e de barras fixas inferiores. */
export const MOBILE_DRAWER_PANEL_Z = 'z-[70]';

/** Padding inferior de páginas longas só com BottomNav (sem faixa de ação fixa). */
export const MOBILE_PAGE_BOTTOM_PADDING =
  'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Nav (5rem) + gap da faixa (1.25rem) + altura da faixa (5.25rem) + safe area. */
export const MOBILE_PAGE_ACTION_BAR_STACK_PADDING =
  'pb-[calc(5rem+1.25rem+5.25rem+env(safe-area-inset-bottom,0px))]';

/** scrollIntoView: BottomNav + safe area + 1rem de folga visual. */
export const MOBILE_CONTENT_SCROLL_MARGIN_BOTTOM =
  'scroll-mb-[calc(5rem+env(safe-area-inset-bottom,0px)+1rem)]';

/** Sticky acima do BottomNav + safe area + 1rem de folga (substitui `bottom-4`). */
export const MOBILE_STICKY_ABOVE_NAV_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+1rem)]';

/**
 * Altura reservada do banner PWA fixo (`PwaInstallPanel` + margens).
 * Medido ~6rem; não alterar offsets da barra PWA em `PwaInstallProvider`.
 */
export const MOBILE_PWA_INSTALL_BANNER_CLEARANCE = '6rem';

/** BottomNav + banner PWA visível + safe area (substitui `MOBILE_PAGE_BOTTOM_PADDING`). */
export const MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA =
  'pb-[calc(5rem+6rem+env(safe-area-inset-bottom,0px))]';

/** Stack nav + faixa de ação + banner PWA + safe area. */
export const MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA =
  'pb-[calc(5rem+1.25rem+5.25rem+6rem+env(safe-area-inset-bottom,0px))]';

/** Offset `bottom` da paginação fixa da vitrine (acima do BottomNav 5rem). */
export const MOBILE_VITRINE_PAGINATION_FIXED_BOTTOM =
  'bottom-[calc(5rem+0.75rem+env(safe-area-inset-bottom,0px))]';

/** Reserva no fluxo do documento: faixa de paginação (botões + legenda + py) + folga. */
export const MOBILE_VITRINE_PAGINATION_SPACER = 'h-[8.5rem]';

/** BottomNav + gap + faixa de paginação + safe area + 1rem de folga visual. */
export const MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING =
  'pb-[calc(5rem+0.75rem+7.5rem+1rem+env(safe-area-inset-bottom,0px))]';

export const MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING_WITH_PWA =
  'pb-[calc(5rem+0.75rem+7.5rem+1rem+6rem+env(safe-area-inset-bottom,0px))]';

export type DashboardPageBottomPaddingVariant = 'default' | 'actionBar' | 'vitrinePagination';

/** Padding inferior de página conforme faixa de ação e banner PWA (sem React). */
export function getDashboardPageBottomPadding(
  variant: DashboardPageBottomPaddingVariant,
  pwaVisible: boolean,
): string {
  if (variant === 'actionBar') {
    return pwaVisible
      ? MOBILE_PAGE_ACTION_BAR_STACK_PADDING_WITH_PWA
      : MOBILE_PAGE_ACTION_BAR_STACK_PADDING;
  }
  if (variant === 'vitrinePagination') {
    return pwaVisible
      ? MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING_WITH_PWA
      : MOBILE_PAGE_VITRINE_PAGINATION_STACK_PADDING;
  }
  return pwaVisible ? MOBILE_PAGE_BOTTOM_PADDING_WITH_PWA : MOBILE_PAGE_BOTTOM_PADDING;
}
