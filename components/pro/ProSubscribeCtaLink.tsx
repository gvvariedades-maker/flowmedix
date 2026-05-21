'use client';

import { Loader2 } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';

export function ProSubscribeCtaLink() {
  const { handleCheckout, loading, error } = useProCheckout();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#BEF264]/80 underline underline-offset-4 transition-colors hover:text-[#BEF264] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Redirecionando…
          </>
        ) : (
          'Já decidi — Assinar Pro por R$ 14,90/mês →'
        )}
      </button>
      {error ? (
        <p className="max-w-sm text-center text-xs font-medium text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
