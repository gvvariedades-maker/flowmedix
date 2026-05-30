/**
 * Layout mobile do dashboard: BottomNav fixo (DashboardShell) + faixas de ação.
 * Usar as mesmas constantes em vitrine/simulados para alinhar offset e z-index.
 *
 * IMPORTANTE: manter classes literais (Tailwind JIT não vê template strings).
 */

/** Offset `bottom` para elementos `fixed` acima do BottomNav + safe area. */
export const MOBILE_BOTTOM_NAV_FIXED_BOTTOM =
  'bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+1.25rem)]';

/** Reserva de scroll para faixa de ação (botão h-12 + py-3 + borda). */
export const MOBILE_ACTION_BAR_SPACER = 'h-[5.25rem]';

/** z-index acima do BottomNav (`z-40`). */
export const MOBILE_ACTION_BAR_Z = 'z-50';

/** Padding inferior de páginas longas só com BottomNav (sem faixa de ação fixa). */
export const MOBILE_PAGE_BOTTOM_PADDING =
  'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]';
