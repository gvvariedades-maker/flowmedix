'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

/** Equivalente ao link "Entrar" da landing, adaptado ao fundo claro das páginas de auth. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900';

const ctaButtonClass =
  'inline-flex items-center gap-2 rounded-xl bg-[#BEF264] px-4 py-2.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]';

export type PublicLightAuthHeaderVariant = 'login' | 'register' | 'auth-other';

export type PublicLightAuthHeaderProps = {
  variant: PublicLightAuthHeaderVariant;
  loginHref?: string;
  registerHref?: string;
};

export function PublicLightAuthHeader({
  variant,
  loginHref = '/login',
  registerHref = '/register',
}: PublicLightAuthHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-xl font-[1000] italic tracking-tighter text-slate-900">AVANT</span>
          </Link>
          <Link href="/blog" className={navLinkClass}>
            Blog
          </Link>
        </div>
        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {variant !== 'login' ? (
            <Link href={loginHref} className={navLinkClass}>
              Entrar
            </Link>
          ) : null}
          {variant !== 'register' ? (
            <Link href={registerHref} className={ctaButtonClass}>
              Criar conta grátis
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
