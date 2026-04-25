'use client';

import { useEffect } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';
import {
  DATA_SERVICE_FRIENDLY_DESCRIPTION,
  DATA_SERVICE_FRIENDLY_TITLE,
  isDataServiceUnavailableError,
} from '@/lib/dataServiceError';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dataService = isDataServiceUnavailableError(error);

  useEffect(() => {
    logger.error('Dashboard error caught by error boundary', error, {
      digest: error.digest,
      code: dataService ? 'AVANT_DATA_SERVICE' : undefined,
    });
  }, [error, dataService]);

  if (dataService) {
    return (
      <div className="dashboard-surface min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card/80 p-8 text-center shadow-lg shadow-indigo-500/5">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
            <CloudOff className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{DATA_SERVICE_FRIENDLY_TITLE}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{DATA_SERVICE_FRIENDLY_DESCRIPTION}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/50 px-3 py-2 text-left text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Tentar de novo
            </button>
            <a
              href="/estudar"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Ir à vitrine
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-red-400 mb-2">⚠️ Erro no Dashboard</h1>
          <p className="text-slate-300 text-lg">Ocorreu um erro ao carregar esta página.</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-950/40 rounded-lg border border-red-500/30 text-left">
              <p className="text-xs text-red-300 font-mono break-all">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Tentar de novo
          </button>
          <a
            href="/estudar"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
          >
            Voltar ao Estudo
          </a>
        </div>
      </div>
    </div>
  );
}
