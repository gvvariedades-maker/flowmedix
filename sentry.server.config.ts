/**
 * Inicialização do Sentry no runtime Node.js (Server Components, Route Handlers,
 * server actions). Importado por `instrumentation.ts` via `register()`.
 *
 * Sem DSN o `Sentry.init` não roda → SDK fica inerte (no-op). Por isso o build
 * e o dev local passam sem nenhuma variável Sentry configurada.
 */
import * as Sentry from '@sentry/nextjs';
import { beforeSendSanitizer, beforeBreadcrumbSanitizer } from '@/lib/monitoring/sentrySanitizer';
import { getSentryEnvironment, getSentryRelease, getEffectiveSentryDsn } from '@/lib/monitoring/sentryEnv';

const dsn = getEffectiveSentryDsn(false);

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    sendDefaultPii: false,
    // Amostragem de tracing — conservadora por padrão (10% em prod, 100% em dev).
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend: beforeSendSanitizer,
    beforeBreadcrumb: beforeBreadcrumbSanitizer,
    enableLogs: false,
    debug: false,
  });
}
