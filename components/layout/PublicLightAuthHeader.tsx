'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';

/** Equivalente ao link "Entrar" da landing, adaptado ao fundo claro das páginas de auth. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900';

const ctaButtonClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#BEF264] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] min-[380px]:gap-2 min-[380px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-4 sm:gap-4 sm:px-6">
        <AvantLogo
          href="/"
          variant="lockup"
          size="nav"
          tone="light"
          animated={false}
          className="flex-none"
        />
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
                <span className="sr-only min-[380px]:hidden">Comece grátis</span>
                <span className="hidden sm:inline">Comece grátis</span>
                <span className="hidden min-[380px]:inline sm:hidden font-bold normal-case tracking-normal text-[11px] text-slate-950">
                  Comece grátis
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
