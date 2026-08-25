/**
 * Inicialização do Sentry no runtime Edge (proxy.ts / middleware e rotas edge).
 * Importado por `instrumentation.ts` quando `NEXT_RUNTIME === 'edge'`.
 *
 * Sem DSN o `Sentry.init` não roda → SDK fica inerte (no-op).
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
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend: beforeSendSanitizer,
    beforeBreadcrumb: beforeBreadcrumbSanitizer,
    enableLogs: false,
    debug: false,
  });
}
