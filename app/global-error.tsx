'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { reportClientError } from '@/lib/monitoring/reportClientError';

// global-error substitui o layout raiz quando o proprio shell HTML quebra.
// Precisa renderizar <html>/<body> e usa estilos inline porque globals.css
// nao e carregado neste fallback.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Global application error caught by global-error boundary', error, {
      digest: error.digest,
    });
    reportClientError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      source: 'global-error',
    });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#010409',
          color: '#e2e8f0',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#f87171',
              margin: '0 0 0.75rem',
            }}
          >
            Erro inesperado
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: '0 0 1.5rem' }}>
            Algo deu errado ao carregar o aplicativo. Tente novamente.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={reset}
              style={{
                minHeight: '44px',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              style={{
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1e293b',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}
            >
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
