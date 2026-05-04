'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Mesmo estilo do link "Entrar" no header da landing. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

export type PublicDarkSiteHeaderProps = {
  ctaLabel: string;
  /** Texto entre 400px e `sm` (ex.: "Criar conta"). Com `ctaLabelTight`, abaixo de 400px usa o tight; sem tight, só ícone + sr. */
  ctaLabelShort?: string;
  /** Texto do CTA em viewports abaixo de 400px (ex.: "Beta Grátis →") para não comprimir o logo. */
  ctaLabelTight?: string;
  ctaHref?: string;
};

/** Reserva espaço para o header fixo (py-4 + linha ~40px). `overflow-x-hidden` no pai quebra `sticky`. */
const HEADER_SPACER_CLASS = 'h-[73px] shrink-0';

const ctaButtonClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#BEF264] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] min-[400px]:gap-2 min-[400px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

export function PublicDarkSiteHeader({
  ctaLabel,
  ctaLabelShort,
  ctaLabelTight,
  ctaHref = '/register',
}: PublicDarkSiteHeaderProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-4 sm:gap-4 sm:px-6">
          <Link
            href="/"
            className="group flex min-w-[max(5rem,min-content)] flex-none items-center gap-2 sm:gap-2.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="shrink-0 text-xl font-[1000] italic tracking-tighter text-white">AVANT</span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
            <Link href="/blog" className={`${navLinkClass} hidden min-[400px]:inline-flex shrink-0`}>
              Blog
            </Link>
            <nav className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
              <Link href="/login" className={`${navLinkClass} shrink-0 px-2 min-[400px]:px-3`}>
                Entrar
              </Link>
              <Link href={ctaHref} className={ctaButtonClass} aria-label={ctaLabel}>
                {ctaLabelTight ? (
                  <span className="hidden max-[399px]:inline sm:hidden text-[10px] font-bold normal-case leading-tight tracking-tight">
                    {ctaLabelTight}
                  </span>
                ) : (
                  <span className="sr-only min-[400px]:hidden">{ctaLabel}</span>
                )}
                <span className="hidden sm:inline">{ctaLabel}</span>
                {ctaLabelShort ? (
                  <span className="hidden min-[400px]:inline sm:hidden font-bold normal-case tracking-normal text-[11px]">
                    {ctaLabelShort}
                  </span>
                ) : (
                  <span className="hidden min-[400px]:inline sm:hidden truncate text-left max-w-[9rem]">
                    {ctaLabel}
                  </span>
                )}
                <ArrowRight size={16} className={cn('shrink-0', ctaLabelTight && 'max-[399px]:hidden')} aria-hidden />
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className={HEADER_SPACER_CLASS} aria-hidden />
    </>
  );
}
