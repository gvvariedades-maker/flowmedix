'use client';

import Link from 'next/link';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { BrandCta, OutlineCta } from '@/components/landing/lp-ui';
import { LANDING_HEADER } from '@/lib/marketing/landingCopy';

type LandingHeaderProps = {
  onProClick: () => void;
};

export function LandingHeader({ onProClick }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f1f5f9]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <AvantLogo href="/" variant="lockup" size="nav" tone="light" animated={false} className="shrink-0" />
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação principal">
          <Link
            href="/planos"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Concursos
          </Link>
          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Entrar
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <OutlineCta href="/register" variant="header" className="hidden px-4 py-2.5 text-xs sm:inline-flex">
            {LANDING_HEADER.ctaFree}
          </OutlineCta>
          <BrandCta onClick={onProClick} className="px-4 py-2.5 text-xs sm:text-sm">
            {LANDING_HEADER.ctaPro}
          </BrandCta>
        </div>
      </div>
    </header>
  );
}
