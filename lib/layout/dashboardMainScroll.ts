/** Marca o `<main>` rolável único do `DashboardShell` (mobile). */
export const DASHBOARD_MAIN_SCROLL_ATTR = 'data-dashboard-main-scroll';

/**
 * Rola o main do dashboard ao topo sem `scrollIntoView` (evita scroll no `document` e jank iOS).
 */
export function scrollDashboardMainToTop(behavior: ScrollBehavior = 'auto'): void {
  if (typeof document === 'undefined') return;
  const main = document.querySelector<HTMLElement>(`main[${DASHBOARD_MAIN_SCROLL_ATTR}]`);
  if (!main) return;
  main.scrollTo({ top: 0, behavior });
}
