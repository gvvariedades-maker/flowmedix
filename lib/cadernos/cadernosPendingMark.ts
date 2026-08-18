import {
  HUB_NAV_SLOW_LOADING_MS,
  isExactHubHref,
  resolveHubNavAnchor,
  shouldClearHubNavPendingOnPath,
  shouldMarkExactHubNavPending,
  type HubNavClickLike,
  type HubNavLocationLike,
} from '@/lib/layout/hubNavPending';

/** Link da lista `/cadernos`, sem query. */
export function isCadernosHubHref(href: string): boolean {
  return isExactHubHref(href, '/cadernos');
}

/** Limiar loading → slow-loading. Não limpa o pending. */
export const CADERNOS_NAV_PENDING_TIMEOUT_MS = HUB_NAV_SLOW_LOADING_MS;

export type CadernosNavClickLike = HubNavClickLike;
export type CadernosNavLocationLike = HubNavLocationLike;

export const resolveCadernosNavAnchor = resolveHubNavAnchor;

export function shouldMarkCadernosNavPending(
  event: CadernosNavClickLike,
  anchor: HTMLAnchorElement,
  location: CadernosNavLocationLike,
): boolean {
  return shouldMarkExactHubNavPending(event, anchor, location, '/cadernos');
}

export function shouldClearCadernosNavPendingOnPath(pathname: string | null): boolean {
  return shouldClearHubNavPendingOnPath(pathname, '/cadernos');
}
