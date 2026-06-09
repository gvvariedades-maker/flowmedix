'use client';

import { useEffect } from 'react';
import { reportClientError } from '@/lib/monitoring/reportClientError';

/**
 * Captura erros nao tratados (window.onerror) e promises rejeitadas sem catch
 * (unhandledrejection) e os reporta para /api/client-error. Montado uma vez no
 * layout raiz. Erros que disparam error boundaries sao reportados separadamente
 * nos proprios boundaries.
 */
export function GlobalErrorListeners() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        message: event.message || 'Uncaught error',
        stack: event.error instanceof Error ? event.error.stack : undefined,
        source: 'window.onerror',
      });
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportClientError({
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === 'string'
              ? reason
              : 'Unhandled promise rejection',
        stack: reason instanceof Error ? reason.stack : undefined,
        source: 'unhandledrejection',
      });
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
