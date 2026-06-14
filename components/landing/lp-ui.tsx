'use client';

import Link from 'next/link';
import { Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { cn } from '@/lib/utils';

export function BrandCta({
  children,
  className,
  onClick,
  disabled,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#8fe020] px-6 py-3.5 text-sm font-black tracking-wide text-[#1a2e05] shadow-[0_8px_24px_rgba(143,224,32,0.35)] transition-all hover:bg-[#9ef028] hover:shadow-[0_12px_32px_rgba(143,224,32,0.4)] disabled:cursor-not-allowed disabled:opacity-60';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, className)}>
      {children}
    </button>
  );
}

export function OutlineCta({
  children,
  className,
  href,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, className)}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8fe020]/30 bg-[#8fe020]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#3d6b0f]">
      <Sparkles size={12} aria-hidden />
      {children}
    </p>
  );
}

export function ProCheckoutCta({ label, className }: { label: string; className?: string }) {
  const { handleCheckout, loading, error } = useProCheckout();

  return (
    <div className={className}>
      <BrandCta onClick={() => void handleCheckout()} disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Abrindo pagamento…
          </>
        ) : (
          label
        )}
      </BrandCta>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EditorialFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-bold text-slate-900">{q}</span>
        <ChevronDown
          size={20}
          className={cn('mt-0.5 shrink-0 text-slate-500 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? <p className="pb-5 text-sm leading-relaxed text-slate-600">{a}</p> : null}
    </div>
  );
}
