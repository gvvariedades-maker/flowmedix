/**
 * Reporta erros do client para /api/client-error (capturados server-side
 * pelo logger). Vendor-neutral: a integracao com Sentry/Vercel pode ser
 * plugada no route handler sem alterar os chamadores.
 *
 * Falhas de envio sao engolidas de proposito — reportar erro nunca deve
 * gerar outro erro visivel ao usuario.
 */

type ClientErrorPayload = {
  message: string;
  stack?: string;
  digest?: string;
  source?: 'error-boundary' | 'global-error' | 'window.onerror' | 'unhandledrejection';
  url?: string;
};

const recentSignatures = new Map<string, number>();
const DEDUPE_WINDOW_MS = 5000;

function isDuplicate(signature: string): boolean {
  const now = Date.now();
  for (const [key, ts] of recentSignatures) {
    if (now - ts > DEDUPE_WINDOW_MS) recentSignatures.delete(key);
  }
  if (recentSignatures.has(signature)) return true;
  recentSignatures.set(signature, now);
  return false;
}

export function reportClientError(payload: ClientErrorPayload): void {
  if (typeof window === 'undefined') return;

  const signature = `${payload.source ?? ''}:${payload.message}`;
  if (isDuplicate(signature)) return;

  const body = JSON.stringify({
    message: payload.message.slice(0, 2000),
    stack: payload.stack?.slice(0, 8000),
    digest: payload.digest,
    source: payload.source,
    url: payload.url ?? window.location.href,
    userAgent: navigator.userAgent,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/client-error', blob);
      if (sent) return;
    }
    void fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // noop
  }
}
