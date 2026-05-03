'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

/** Mesmo estilo do link "Entrar" no header da landing. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

export type PublicDarkSiteHeaderProps = {
  ctaLabel: string;
  ctaHref?: string;
};

/** Reserva espaço para o header fixo (py-4 + linha ~40px). `overflow-x-hidden` no pai quebra `sticky`. */
const HEADER_SPACER_CLASS = 'h-[73px] shrink-0';

export function PublicDarkSiteHeader({ ctaLabel, ctaHref = '/register' }: PublicDarkSiteHeaderProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
                <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
              </div>
              <span className="text-xl font-[1000] italic tracking-tighter text-white">AVANT</span>
            </Link>
            <Link href="/blog" className={navLinkClass}>
              Blog
            </Link>
          </div>
          <nav className="flex shrink-0 flex-nowrap items-center justify-end gap-2 sm:gap-3">
            <Link href="/login" className={navLinkClass}>
              Entrar
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#BEF264] px-4 py-2.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]"
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>
      <div className={HEADER_SPACER_CLASS} aria-hidden />
    </>
  );
}
