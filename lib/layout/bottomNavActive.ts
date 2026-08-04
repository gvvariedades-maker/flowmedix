/** Espelha `isPathActive` do DashboardShell (prefixo com barra). */
function isPathPrefixActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export const BOTTOM_NAV_HREFS = {
  estudar: '/estudar',
  simulados: '/simulados',
  progresso: '/progresso',
  cadernos: '/cadernos',
} as const;

export type BottomNavHref = (typeof BOTTOM_NAV_HREFS)[keyof typeof BOTTOM_NAV_HREFS];

/** Estado ativo dos quatro links principais — alinhado ao drawer/sidebar. */
export function isBottomNavItemActive(pathname: string, href: string): boolean {
  if (!pathname) return false;

  switch (href) {
    case BOTTOM_NAV_HREFS.estudar:
      return isPathPrefixActive(pathname, BOTTOM_NAV_HREFS.estudar);
    case BOTTOM_NAV_HREFS.simulados:
      return (
        isPathPrefixActive(pathname, BOTTOM_NAV_HREFS.simulados) ||
        isPathPrefixActive(pathname, '/desempenho/simulados')
      );
    case BOTTOM_NAV_HREFS.progresso:
      return pathname === '/progresso' || pathname === '/analytics';
    case BOTTOM_NAV_HREFS.cadernos:
      return isPathPrefixActive(pathname, BOTTOM_NAV_HREFS.cadernos);
    default:
      return false;
  }
}

/** Rotas exclusivas do drawer (botão Mais) — exclui as quatro abas principais. */
export function isBottomNavMaisActive(pathname: string): boolean {
  if (!pathname) return false;

  if (isBottomNavItemActive(pathname, BOTTOM_NAV_HREFS.estudar)) return false;
  if (isBottomNavItemActive(pathname, BOTTOM_NAV_HREFS.simulados)) return false;
  if (isBottomNavItemActive(pathname, BOTTOM_NAV_HREFS.progresso)) return false;
  if (isBottomNavItemActive(pathname, BOTTOM_NAV_HREFS.cadernos)) return false;

  if (pathname === '/ajuda' || pathname.startsWith('/ajuda/')) return true;
  if (isPathPrefixActive(pathname, '/material')) return true;
  if (isPathPrefixActive(pathname, '/conta')) return true;

  return false;
}
