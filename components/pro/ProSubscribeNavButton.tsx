'use client';

import { Loader2 } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';

export function ProSubscribeNavButton() {
  const { handleCheckout, loading } = useProCheckout();

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="hidden shrink-0 items-center justify-center rounded-2xl border border-[#BEF264]/40 bg-transparent px-5 py-2 text-sm font-black uppercase tracking-widest text-[#BEF264] transition-all hover:bg-[#BEF264]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden />
      ) : (
        'Assinar Pro'
      )}
    </button>
  );
}
