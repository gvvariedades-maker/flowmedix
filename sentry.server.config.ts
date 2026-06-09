/**
 * Inicialização do Sentry no runtime Node.js (Server Components, Route Handlers,
 * server actions). Importado por `instrumentation.ts` via `register()`.
 *
 * Sem DSN o `Sentry.init` não roda → SDK fica inerte (no-op). Por isso o build
 * e o dev local passam sem nenhuma variável Sentry configurada.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Amostragem de tracing — conservadora por padrão; ajuste via env se quiser.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enableLogs: false,
    debug: false,
  });
}
