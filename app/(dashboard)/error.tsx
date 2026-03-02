'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Dashboard error caught by error boundary', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-red-400 mb-2">
            ⚠️ Erro no Dashboard
          </h1>
          <p className="text-slate-300 text-lg">
            Ocorreu um erro ao carregar esta página.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-950/40 rounded-lg border border-red-500/30 text-left">
              <p className="text-xs text-red-300 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Tentar Novamente
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
