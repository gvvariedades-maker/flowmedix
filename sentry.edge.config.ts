/**
 * Inicialização do Sentry no runtime Edge (proxy.ts / middleware e rotas edge).
 * Importado por `instrumentation.ts` quando `NEXT_RUNTIME === 'edge'`.
 *
 * Sem DSN o `Sentry.init` não roda → SDK fica inerte (no-op).
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enableLogs: false,
    debug: false,
  });
}
