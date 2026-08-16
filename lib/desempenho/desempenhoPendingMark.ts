/** Link do hub Estudo (`/desempenho`), sem query. */
export function isDesempenhoHubHref(href: string): boolean {
  return href.split('?')[0] === '/desempenho';
}

/** Tempo máximo com skeleton se o hub não chegar (erro, redirect, hang). */
export const DESEMPENHO_NAV_PENDING_TIMEOUT_MS = 8_000;

export type DesempenhoNavClickLike = {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

export type DesempenhoNavLocationLike = {
  pathname: string;
  origin: string;
};

export function resolveDesempenhoNavAnchor(eventTarget: EventTarget | null): HTMLAnchorElement | null {
  if (!(eventTarget instanceof Element)) return null;
  const link = eventTarget.closest('a[href]');
  return link instanceof HTMLAnchorElement ? link : null;
}

function isSameTabTarget(anchor: HTMLAnchorElement): boolean {
  const target = (anchor.getAttribute('target') ?? '').trim();
  return target === '' || target === '_self';
}

/**
 * Clique semântico no hub Estudo: botão principal, mesma aba, mesma origem.
 * Ignora modificadores (Ctrl/Meta/Shift/Alt), download, target ≠ _self e rota atual.
 */
export function shouldMarkDesempenhoNavPending(
  event: DesempenhoNavClickLike,
  anchor: HTMLAnchorElement,
  location: DesempenhoNavLocationLike,
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
  if (!isDesempenhoHubHref(url.pathname)) return false;
  if (location.pathname === '/desempenho') return false;
  return true;
}

export function shouldClearDesempenhoNavPendingOnPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/estudar' || pathname.startsWith('/estudar/')) return false;
  if (pathname === '/desempenho' || pathname.startsWith('/desempenho/')) return false;
  return true;
}
