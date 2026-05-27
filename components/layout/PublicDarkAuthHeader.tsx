'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { AVANT_PRO_LP_HREF } from '@/lib/pro/constants';
import { cn } from '@/lib/utils';

const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

const navLinkClassMobile =
  'rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:text-white min-[400px]:text-xs';

const ctaButtonClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#BEF264] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] min-[380px]:gap-2 min-[380px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

export type PublicDarkAuthHeaderVariant = 'login' | 'register' | 'auth-other';

export type PublicDarkAuthHeaderProps = {
  variant: PublicDarkAuthHeaderVariant;
  loginHref?: string;
  registerHref?: string;
};

function AuthCtaButton({ href, className }: { href: string; className?: string }) {
  return (
    <Link href={href} className={cn(ctaButtonClass, className)} aria-label="Comece grátis">
      <span className="hidden sm:inline">Comece grátis</span>
      <span className="inline max-w-[9.5rem] truncate font-bold normal-case leading-tight tracking-normal sm:hidden">
        Comece grátis
      </span>
      <ArrowRight size={16} className="shrink-0" aria-hidden />
    </Link>
  );
}

function AuthNavActions({
  variant,
  loginHref,
  registerHref,
  linkClassName,
  ctaClassName,
}: {
  variant: PublicDarkAuthHeaderVariant;
  loginHref: string;
  registerHref: string;
  linkClassName?: string;
  ctaClassName?: string;
}) {
  return (
    <>
      {variant !== 'login' ? (
        <Link href={loginHref} className={cn(linkClassName ?? navLinkClass, 'shrink-0')}>
          Entrar
        </Link>
      ) : null}
      {variant !== 'register' ? <AuthCtaButton href={registerHref} className={ctaClassName} /> : null}
    </>
  );
}

/** Header escuro para `/login` e `/register`: mesma navegação que `PublicLightAuthHeader`, tokens como `PublicDarkSiteHeader`. */
export function PublicDarkAuthHeader({
  variant,
  loginHref = '/login',
  registerHref = '/register',
}: PublicDarkAuthHeaderProps) {
  const secondaryNav = (
    <>
      <Link href="/blog" className={navLinkClassMobile}>
        Blog
      </Link>
      <Link href="/planos" className={navLinkClassMobile}>
        Concursos abertos
      </Link>
      <Link href={AVANT_PRO_LP_HREF} className={navLinkClassMobile}>
        AVANT Pro
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-4">
        {/* Mobile: logo na 1ª linha; links secundários na 2ª (evita sobrepor a logo) */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <AvantLogo href="/" variant="icon" size="nav" className="min-w-0" />
            <nav className="flex shrink-0 items-center gap-1" aria-label="Acesso à conta">
              <AuthNavActions
                variant={variant}
                loginHref={loginHref}
                registerHref={registerHref}
                linkClassName={navLinkClassMobile}
                ctaClassName="!px-2.5 !py-1.5 !text-[10px] min-[400px]:!text-xs"
              />
            </nav>
          </div>
          <nav
            className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-white/5 pt-2"
            aria-label="Navegação secundária"
          >
            {secondaryNav}
          </nav>
        </div>

        {/* Desktop / tablet */}
        <div className="hidden items-center justify-between gap-4 sm:flex">
          <AvantLogo
            href="/"
            variant="lockup"
            size="nav"
            animated={false}
            className="flex-none transition-transform hover:scale-[1.02]"
          />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
            <Link href="/blog" className={`${navLinkClass} hidden min-[380px]:inline-flex shrink-0`}>
              Blog
            </Link>
            <Link
              href="/planos"
              className={`${navLinkClass} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
            >
              <span className="sm:hidden">Concursos</span>
              <span className="hidden sm:inline">Concursos abertos</span>
            </Link>
            <Link
              href={AVANT_PRO_LP_HREF}
              className={`${navLinkClass} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
            >
              AVANT Pro
            </Link>
            <nav className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
              <AuthNavActions
                variant={variant}
                loginHref={loginHref}
                registerHref={registerHref}
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
