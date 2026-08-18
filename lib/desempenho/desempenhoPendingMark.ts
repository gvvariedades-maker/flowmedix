import {
  HUB_NAV_SLOW_LOADING_MS,
  isExactHubHref,
  resolveHubNavAnchor,
  shouldClearHubNavPendingOnPath,
  shouldMarkExactHubNavPending,
  type HubNavClickLike,
  type HubNavLocationLike,
} from '@/lib/layout/hubNavPending';

/** Link do hub Estudo (`/desempenho`), sem query. */
export function isDesempenhoHubHref(href: string): boolean {
  return isExactHubHref(href, '/desempenho');
}

/** Limiar loading → slow-loading. Não limpa o pending. */
export const DESEMPENHO_NAV_PENDING_TIMEOUT_MS = HUB_NAV_SLOW_LOADING_MS;

export type DesempenhoNavClickLike = HubNavClickLike;
export type DesempenhoNavLocationLike = HubNavLocationLike;

export const resolveDesempenhoNavAnchor = resolveHubNavAnchor;

/**
 * Clique semântico no hub Estudo: botão principal, mesma aba, mesma origem.
 * Ignora modificadores (Ctrl/Meta/Shift/Alt), download, target ≠ _self e rota atual.
 */
export function shouldMarkDesempenhoNavPending(
  event: DesempenhoNavClickLike,
  anchor: HTMLAnchorElement,
  location: DesempenhoNavLocationLike,
): boolean {
  return shouldMarkExactHubNavPending(event, anchor, location, '/desempenho');
}

export function shouldClearDesempenhoNavPendingOnPath(pathname: string | null): boolean {
  return shouldClearHubNavPendingOnPath(pathname, '/desempenho');
}
