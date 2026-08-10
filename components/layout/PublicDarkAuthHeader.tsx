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
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#FF8A3D] via-[#F26522] to-[#D45212] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#F26522]/25 transition-all hover:scale-[1.02] hover:brightness-95 min-[380px]:gap-2 min-[380px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

const ctaButtonEditorialClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#FF8A3D] via-[#F26522] to-[#D45212] px-2.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-95 min-[380px]:gap-2 min-[380px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

const navLinkEditorialClass =
  'rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900';

const navLinkEditorialMobileClass =
  'rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:text-slate-900 min-[400px]:text-xs';

/** Login/register no header — mais contraste que links secundários (Blog, Planos) */
const navAuthEditorialAccentClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-900 transition-colors hover:text-[#9A3412]';

const navAuthEditorialAccentMobileClass =
  'rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 transition-colors hover:text-[#9A3412] min-[400px]:text-sm';

export type PublicDarkAuthHeaderVariant = 'login' | 'register' | 'auth-other';

export type PublicDarkAuthHeaderProps = {
  variant: PublicDarkAuthHeaderVariant;
  loginHref?: string;
  registerHref?: string;
  /** Editorial v2 — padrão em `/login`, `/register` e fluxos auth claros. */
  appearance?: 'dark' | 'editorial';
};

function AuthCtaButton({
  href,
  className,
  editorial,
}: {
  href: string;
  className?: string;
  editorial?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(editorial ? ctaButtonEditorialClass : ctaButtonClass, className)}
      aria-label="Comece grátis"
    >
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
  editorial,
}: {
  variant: PublicDarkAuthHeaderVariant;
  loginHref: string;
  registerHref: string;
  linkClassName?: string;
  ctaClassName?: string;
  editorial?: boolean;
}) {
  const linkBase = linkClassName ?? navLinkClass;
  const editorialAccent =
    linkClassName === navLinkEditorialMobileClass || linkClassName === navLinkClassMobile
      ? navAuthEditorialAccentMobileClass
      : navAuthEditorialAccentClass;

  /* Editorial: um CTA verde no form; header só com links de texto */
  if (editorial) {
    if (variant === 'login') {
      return (
        <Link href={registerHref} className={cn(editorialAccent, 'shrink-0')}>
          Cadastre-se
        </Link>
      );
    }
    if (variant === 'register') {
      return (
        <Link href={loginHref} className={cn(editorialAccent, 'shrink-0')}>
          Entrar
        </Link>
      );
    }
    return (
      <>
        <Link href={loginHref} className={cn(editorialAccent, 'shrink-0')}>
          Entrar
        </Link>
        <Link href={registerHref} className={cn(editorialAccent, 'shrink-0')}>
          Cadastre-se
        </Link>
      </>
    );
  }

  return (
    <>
      {variant !== 'login' ? (
        <Link href={loginHref} className={cn(linkBase, 'shrink-0')}>
          Entrar
        </Link>
      ) : null}
      {variant !== 'register' ? (
        <AuthCtaButton href={registerHref} className={ctaClassName} editorial={editorial} />
      ) : null}
    </>
  );
}

/** Header escuro para `/login` e `/register`: mesma navegação que `PublicLightAuthHeader`, tokens como `PublicDarkSiteHeader`. */
export function PublicDarkAuthHeader({
  variant,
  loginHref = '/login',
  registerHref = '/register',
  appearance = 'editorial',
}: PublicDarkAuthHeaderProps) {
  const editorial = appearance === 'editorial';
  const linkDesktop = editorial ? navLinkEditorialClass : navLinkClass;
  const linkMobile = editorial ? navLinkEditorialMobileClass : navLinkClassMobile;

  const secondaryNav = (
    <>
      <Link href="/blog" className={linkMobile}>
        Blog
      </Link>
      <Link href="/planos" className={linkMobile}>
        Concursos abertos
      </Link>
      <Link href={AVANT_PRO_LP_HREF} className={linkMobile}>
        AVANT enf Pro
      </Link>
    </>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b backdrop-blur-xl',
        editorial
          ? 'border-slate-200 bg-white/90'
          : 'border-white/5 bg-slate-950/55',
      )}
    >
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-4">
        {/* Mobile: logo na 1ª linha; links secundários na 2ª (evita sobrepor a logo) */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <AvantLogo
              href="/"
              variant="lockup"
              size="nav"
              tone={editorial ? 'light' : 'default'}
              animated={false}
              className="min-w-0"
            />
            <nav className="flex shrink-0 items-center gap-1" aria-label="Acesso à conta">
              <AuthNavActions
                variant={variant}
                loginHref={loginHref}
                registerHref={registerHref}
                linkClassName={linkMobile}
                ctaClassName="!px-2.5 !py-1.5 !text-[10px] min-[400px]:!text-xs"
                editorial={editorial}
              />
            </nav>
          </div>
          <nav
            className={cn(
              'flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t pt-2',
              editorial ? 'border-slate-200' : 'border-white/5',
            )}
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
            tone={editorial ? 'light' : 'default'}
            animated={false}
            className="flex-none"
          />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
            <Link href="/blog" className={`${linkDesktop} hidden min-[380px]:inline-flex shrink-0`}>
              Blog
            </Link>
            <Link
              href="/planos"
              className={`${linkDesktop} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
            >
              <span className="sm:hidden">Concursos</span>
              <span className="hidden sm:inline">Concursos abertos</span>
            </Link>
            <Link
              href={AVANT_PRO_LP_HREF}
              className={`${linkDesktop} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
            >
              AVANT enf Pro
            </Link>
            <nav className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
              <AuthNavActions
                variant={variant}
                loginHref={loginHref}
                registerHref={registerHref}
                editorial={editorial}
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
