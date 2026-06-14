'use client';

import { Loader2 } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { cn } from '@/lib/utils';

type ProSubscribeCtaLinkProps = {
  variant?: 'link' | 'button';
  className?: string;
};

export function ProSubscribeCtaLink({ variant = 'link', className }: ProSubscribeCtaLinkProps) {
  const { handleCheckout, loading, error } = useProCheckout();

  const isButton = variant === 'button';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          isButton
            ? 'w-full rounded-2xl bg-[#8fe020] px-6 py-3.5 text-sm font-black uppercase tracking-widest text-slate-950 hover:bg-[#a8f53c]'
            : 'text-sm font-bold text-[#8fe020]/80 underline underline-offset-4 hover:text-[#8fe020]',
        )}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Redirecionando…
          </>
        ) : isButton ? (
          'Assinar AVANT Pro'
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
