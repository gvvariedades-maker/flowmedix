/**
 * Hook de instrumentação do Next.js (Next 15+/16). Carrega a config do Sentry
 * conforme o runtime e expõe `onRequestError` para capturar erros de Server
 * Components, Route Handlers e proxy.
 *
 * Os arquivos de config só chamam `Sentry.init` quando há DSN, então sem env
 * Sentry tudo isto é no-op.
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
