/**
 * Inicialização do Sentry no browser (Next 15.3+/16 usa `instrumentation-client`
 * no lugar de `sentry.client.config`). Executa antes do app hidratar.
 *
 * Sem `NEXT_PUBLIC_SENTRY_DSN` o `Sentry.init` não roda → SDK inerte (no-op) e
 * o app continua reportando erros pelo seam `/api/client-error`.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    enableLogs: false,
    debug: false,
  });
}

// Instrumenta navegações do App Router (Next 15.3+).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
