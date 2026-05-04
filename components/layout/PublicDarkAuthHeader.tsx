'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

const ctaButtonClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#BEF264] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] min-[380px]:gap-2 min-[380px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

export type PublicDarkAuthHeaderVariant = 'login' | 'register' | 'auth-other';

export type PublicDarkAuthHeaderProps = {
  variant: PublicDarkAuthHeaderVariant;
  loginHref?: string;
  registerHref?: string;
};

/** Header escuro para `/login` e `/register`: mesma navegação que `PublicLightAuthHeader`, tokens como `PublicDarkSiteHeader`. */
export function PublicDarkAuthHeader({
  variant,
  loginHref = '/login',
  registerHref = '/register',
}: PublicDarkAuthHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-4 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex flex-none items-center gap-2 sm:gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
            <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
          </div>
          <span className="text-xl font-[1000] italic tracking-tighter text-white">AVANT</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
          <Link href="/blog" className={`${navLinkClass} hidden min-[380px]:inline-flex shrink-0`}>
            Blog
          </Link>
          <nav className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
            {variant !== 'login' ? (
              <Link href={loginHref} className={`${navLinkClass} shrink-0 px-2 min-[380px]:px-3`}>
                Entrar
              </Link>
            ) : null}
            {variant !== 'register' ? (
              <Link href={registerHref} className={ctaButtonClass}>
                <span className="sr-only min-[380px]:hidden">Criar conta grátis</span>
                <span className="hidden sm:inline">Criar conta grátis</span>
                <span className="hidden min-[380px]:inline sm:hidden font-bold normal-case tracking-normal text-[11px] text-slate-950">
                  Criar conta
                </span>
                <ArrowRight size={16} className="shrink-0" aria-hidden />
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
