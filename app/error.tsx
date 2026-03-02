'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    logger.error('Application error caught by error boundary', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-red-400 mb-2">
            ⚠️ Erro Inesperado
          </h1>
          <p className="text-slate-300 text-lg">
            Algo deu errado. Nossa equipe foi notificada.
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
            href="/"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}
