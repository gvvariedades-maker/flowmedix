'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { logger } from '@/lib/logger';
import { reportClientError } from '@/lib/monitoring/reportClientError';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error caught by error boundary', error, {
      digest: error.digest,
    });
    reportClientError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      source: 'error-boundary',
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
          <TriangleAlert className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Erro inesperado</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Algo deu errado. O erro foi registrado e você pode tentar novamente.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-mono text-slate-500 break-all">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-editorial-primary inline-flex h-11 items-center justify-center gap-2 px-6"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Tentar novamente
          </button>
          <Link href="/" className="btn-editorial-outline inline-flex h-11 items-center justify-center px-6">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
