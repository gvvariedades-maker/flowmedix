'use client';

import { Loader2 } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';

export function ProSubscribeNavButton() {
  const { handleCheckout, loading, error } = useProCheckout();

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        title={error ?? undefined}
        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#BEF264]/40 bg-transparent px-5 py-2 text-sm font-black uppercase tracking-widest text-[#BEF264] transition-all hover:bg-[#BEF264]/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          'Assinar Pro'
        )}
      </button>
      {error ? (
        <p className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-rose-500/25 bg-slate-950 px-3 py-2 text-xs font-medium text-rose-300 shadow-lg" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
