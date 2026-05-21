'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Zap } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { proCheckoutLoginHref } from '@/lib/pro/checkoutPaths';

export default function AssinarProPage() {
  const { handleCheckout, loading, error } = useProCheckout();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleCheckout();
  }, [handleCheckout]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010409] px-4 text-center text-slate-100">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
        <Zap size={24} className="text-[#BEF264]" fill="currentColor" aria-hidden />
      </div>
      {loading && !error ? (
        <>
          <Loader2 size={32} className="animate-spin text-[#BEF264]" aria-hidden />
          <p className="mt-4 text-sm font-medium text-slate-400">Abrindo pagamento seguro…</p>
        </>
      ) : null}
      {error ? (
        <div className="max-w-md space-y-4">
          <p className="text-sm font-medium text-rose-300" role="alert">
            {error}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                started.current = true;
                void handleCheckout();
              }}
              disabled={loading}
              className="rounded-2xl bg-[#BEF264] px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 disabled:opacity-60"
            >
              Tentar novamente
            </button>
            <Link
              href={proCheckoutLoginHref()}
              className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Entrar para assinar
            </Link>
          </div>
          <Link href="/" className="block text-sm text-slate-500 hover:text-slate-300">
            Voltar à página inicial
          </Link>
        </div>
      ) : null}
    </div>
  );
}
