'use client';

import Link from 'next/link';
import { Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { useState, type ComponentPropsWithoutRef } from 'react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { cn } from '@/lib/utils';

const brandCtaSizes = {
  default: 'min-h-11 px-6 py-3.5 text-sm',
  lg: 'min-h-12 px-8 py-4 text-lg',
} as const;

const outlineCtaSizes = {
  default: 'min-h-11 px-6 py-3.5 text-sm',
  lg: 'min-h-12 px-8 py-4 text-lg',
} as const;

export function BrandCta({
  children,
  className,
  onClick,
  disabled,
  href,
  size = 'default',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  size?: keyof typeof brandCtaSizes;
} & Omit<ComponentPropsWithoutRef<'button'>, 'onClick' | 'disabled' | 'children' | 'className'>) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#8fe020] font-black tracking-wide text-[#1a2e05] shadow-[0_8px_24px_rgba(143,224,32,0.35)] transition-all hover:bg-[#9ef028] hover:shadow-[0_12px_32px_rgba(143,224,32,0.4)] disabled:cursor-not-allowed disabled:opacity-60',
    brandCtaSizes[size],
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, className)} {...rest}>
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
  size = 'default',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: keyof typeof outlineCtaSizes;
  /** `header` = borda slate-300 para nav sticky */
  variant?: 'default' | 'header';
}) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 bg-white font-bold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
    variant === 'header'
      ? 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
      : 'border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50',
    outlineCtaSizes[size],
  );

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
