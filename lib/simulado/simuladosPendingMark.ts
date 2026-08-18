import {
  HUB_NAV_SLOW_LOADING_MS,
  isExactHubHref,
  resolveHubNavAnchor,
  shouldClearHubNavPendingOnPath,
  shouldMarkExactHubNavPending,
  type HubNavClickLike,
  type HubNavLocationLike,
} from '@/lib/layout/hubNavPending';

/** Link da lista `/simulados`, sem query. Não inclui `/desempenho/simulados`. */
export function isSimuladosHubHref(href: string): boolean {
  return isExactHubHref(href, '/simulados');
}

/** Limiar loading → slow-loading. Não limpa o pending. */
export const SIMULADOS_NAV_PENDING_TIMEOUT_MS = HUB_NAV_SLOW_LOADING_MS;

export type SimuladosNavClickLike = HubNavClickLike;
export type SimuladosNavLocationLike = HubNavLocationLike;

export const resolveSimuladosNavAnchor = resolveHubNavAnchor;

export function shouldMarkSimuladosNavPending(
  event: SimuladosNavClickLike,
  anchor: HTMLAnchorElement,
  location: SimuladosNavLocationLike,
): boolean {
  return shouldMarkExactHubNavPending(event, anchor, location, '/simulados');
}

export function shouldClearSimuladosNavPendingOnPath(pathname: string | null): boolean {
  return shouldClearHubNavPendingOnPath(pathname, '/simulados');
}
