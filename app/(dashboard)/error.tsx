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
import { DASHBOARD_PAGE_CENTER } from '@/lib/layout/mobileBottomNav';
import { cn } from '@/lib/utils';

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
      <div className={cn('dashboard-surface flex-col bg-background p-6', DASHBOARD_PAGE_CENTER)}>
        <div className="card-elevated-lg w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
            <CloudOff className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{DATA_SERVICE_FRIENDLY_TITLE}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{DATA_SERVICE_FRIENDLY_DESCRIPTION}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-mono text-slate-500 break-all">
              {error.message}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-editorial-primary inline-flex h-11 items-center justify-center gap-2 px-6"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Tentar de novo
            </button>
            <Link href="/estudar" className="btn-editorial-outline inline-flex h-11 items-center justify-center px-6">
              Voltar para a Vitrine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('dashboard-surface flex-col bg-background p-6', DASHBOARD_PAGE_CENTER)}>
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
          <TriangleAlert className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Erro no dashboard</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Ocorreu um erro ao carregar esta página. Tente novamente ou volte à vitrine.
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
            onClick={() => reset()}
            className="btn-editorial-primary inline-flex h-11 items-center justify-center gap-2 px-6"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Tentar de novo
          </button>
          <Link href="/estudar" className="btn-editorial-outline inline-flex h-11 items-center justify-center px-6">
            Voltar para a Vitrine
          </Link>
        </div>
      </div>
    </div>
  );
}
