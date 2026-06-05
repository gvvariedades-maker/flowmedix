'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CloudOff, RefreshCw, TriangleAlert } from 'lucide-react';
import { logger } from '@/lib/logger';
import {
  DATA_SERVICE_FRIENDLY_DESCRIPTION,
  DATA_SERVICE_FRIENDLY_TITLE,
  isDataServiceUnavailableError,
} from '@/lib/dataServiceError';

export default function EstudarQuestaoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dataService = isDataServiceUnavailableError(error);

  useEffect(() => {
    logger.error('Estudar questão error caught by error boundary', error, {
      digest: error.digest,
      code: dataService ? 'AVANT_DATA_SERVICE' : undefined,
    });
  }, [error, dataService]);

  if (dataService) {
    return (
      <div className="flex min-h-[min(70vh,32rem)] flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <CloudOff className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{DATA_SERVICE_FRIENDLY_TITLE}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{DATA_SERVICE_FRIENDLY_DESCRIPTION}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs font-mono text-slate-500 break-all">
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
            <Link
              href="/estudar"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
            >
              Voltar à vitrine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[min(70vh,32rem)] flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <TriangleAlert className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-100">Erro ao carregar a questão</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Não foi possível abrir esta questão. Tente novamente ou volte à vitrine para escolher outra.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs font-mono text-slate-500 break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Tentar de novo
          </button>
          <Link
            href="/estudar"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Voltar à vitrine
          </Link>
        </div>
      </div>
    </div>
  );
}
