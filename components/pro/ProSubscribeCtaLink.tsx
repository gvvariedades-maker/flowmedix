'use client';

import { Loader2 } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';

export function ProSubscribeCtaLink() {
  const { handleCheckout, loading } = useProCheckout();

  return (
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
  );
}
