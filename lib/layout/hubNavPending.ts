export type HubNavClickLike = {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

export type HubNavLocationLike = {
  pathname: string;
  origin: string;
};

/** Hubs que compartilham o pending da nav. */
export type HubNavId = 'desempenho' | 'cadernos' | 'simulados';

export type HubNavPendingPhase = 'loading' | 'slow-loading';

/** Limiar loading → slow-loading. Não limpa o pending. */
export const HUB_NAV_SLOW_LOADING_MS = 8_000;

export const HUB_NAV_PENDING_PHASE_ATTR = 'data-hub-nav-pending-phase';

export const HUB_NAV_REGISTRY: Record<
  HubNavId,
  { path: string; readySelector: string; pendingAttr: string }
> = {
  desempenho: {
    path: '/desempenho',
    readySelector: '[data-desempenho-hub="estudo"]',
    pendingAttr: 'data-desempenho-nav-pending',
  },
  cadernos: {
    path: '/cadernos',
    readySelector: '[data-cadernos-hub="lista"]',
    pendingAttr: 'data-cadernos-nav-pending',
  },
  simulados: {
    path: '/simulados',
    readySelector: '[data-simulados-hub="lista"]',
    pendingAttr: 'data-simulados-nav-pending',
  },
};

export function hubNavIds(): HubNavId[] {
  return Object.keys(HUB_NAV_REGISTRY) as HubNavId[];
}

export function resolveHubNavAnchor(eventTarget: EventTarget | null): HTMLAnchorElement | null {
  if (!(eventTarget instanceof Element)) return null;
  const link = eventTarget.closest('a[href]');
  return link instanceof HTMLAnchorElement ? link : null;
}

function isSameTabTarget(anchor: HTMLAnchorElement): boolean {
  const target = (anchor.getAttribute('target') ?? '').trim();
  return target === '' || target === '_self';
}

export function isExactHubHref(href: string, hubPath: string): boolean {
  return href.split('?')[0] === hubPath;
}

/**
 * Clique semântico num hub de lista (path exato): botão principal, mesma aba, mesma origem.
 * Ignora modificadores (Ctrl/Meta/Shift/Alt), download, target ≠ _self e rota atual.
 */
export function shouldMarkExactHubNavPending(
  event: HubNavClickLike,
  anchor: HTMLAnchorElement,
  location: HubNavLocationLike,
  hubPath: string,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return false;
  if (anchor.hasAttribute('download')) return false;
  if (!isSameTabTarget(anchor)) return false;

  let url: URL;
  try {
    url = new URL(anchor.getAttribute('href') ?? '', location.origin);
  } catch {
    return false;
  }
  if (url.origin !== location.origin) return false;
  if (!isExactHubHref(url.pathname, hubPath)) return false;
  if (location.pathname === hubPath) return false;
  return true;
}

export function resolveHubNavPendingFromClick(
  event: HubNavClickLike,
  anchor: HTMLAnchorElement,
  location: HubNavLocationLike,
): HubNavId | null {
  for (const id of hubNavIds()) {
    if (shouldMarkExactHubNavPending(event, anchor, location, HUB_NAV_REGISTRY[id].path)) {
      return id;
    }
  }
  return null;
}

/** Mantém pending na vitrine e no próprio hub (incl. subrotas); limpa no restante. */
export function shouldClearHubNavPendingOnPath(
  pathname: string | null,
  hubPath: string,
): boolean {
  if (!pathname) return false;
  if (pathname === '/estudar' || pathname.startsWith('/estudar/')) return false;
  if (pathname === hubPath || pathname.startsWith(`${hubPath}/`)) return false;
  return true;
}

export function resolveSlowLoadingPhase(
  elapsedMs: number,
  thresholdMs: number = HUB_NAV_SLOW_LOADING_MS,
): HubNavPendingPhase {
  return elapsedMs >= thresholdMs ? 'slow-loading' : 'loading';
}

export function applyHubNavPendingDom(hub: HubNavId, phase: HubNavPendingPhase): void {
  const root = document.documentElement;
  for (const id of hubNavIds()) {
    root.removeAttribute(HUB_NAV_REGISTRY[id].pendingAttr);
  }
  root.setAttribute(HUB_NAV_REGISTRY[hub].pendingAttr, 'true');
  root.setAttribute(HUB_NAV_PENDING_PHASE_ATTR, phase);
}

export function clearHubNavPendingDom(): void {
  const root = document.documentElement;
  for (const id of hubNavIds()) {
    root.removeAttribute(HUB_NAV_REGISTRY[id].pendingAttr);
  }
  root.removeAttribute(HUB_NAV_PENDING_PHASE_ATTR);
}

export function isHubNavPrefetchDisabled(href: string): boolean {
  return hubNavIds().some((id) => isExactHubHref(href, HUB_NAV_REGISTRY[id].path));
}
