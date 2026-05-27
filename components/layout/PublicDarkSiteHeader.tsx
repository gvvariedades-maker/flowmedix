'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { ProSubscribeNavButton } from '@/components/pro/ProSubscribeNavButton';
import { AVANT_PRO_LP_HREF } from '@/lib/pro/constants';
import { cn } from '@/lib/utils';

/** Mesmo estilo do link "Entrar" no header da landing. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

const navLinkClassMobile =
  'rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-300 transition-colors hover:text-white min-[400px]:text-xs';

export type PublicDarkSiteHeaderProps = {
  ctaLabel: string;
  /** Texto entre 400px e `sm` (ex.: "Criar conta"). Com `ctaLabelTight`, abaixo de 400px usa o tight; sem tight, só ícone + sr. */
  ctaLabelShort?: string;
  /** Texto do CTA em viewports abaixo de 400px (ex.: "Beta Grátis →") para não comprimir o logo. */
  ctaLabelTight?: string;
  ctaHref?: string;
  /** Botão secundário «Assinar Pro» (checkout Stripe). */
  showProSubscribe?: boolean;
  /** Link «AVANT Pro» no nav (ocultar na homepage, onde o destino é `/`). */
  showAvantProLink?: boolean;
  /** Link «Concursos abertos» (ocultar em `/planos`). */
  showPlanosLink?: boolean;
};

/** Reserva espaço para o header fixo. Mobile usa duas linhas. */
const HEADER_SPACER_CLASS = 'h-[6.75rem] shrink-0 sm:h-[73px]';

const ctaButtonClass =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#BEF264] px-2.5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] min-[400px]:gap-2 min-[400px]:px-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

function CtaButton({
  ctaHref,
  ctaLabel,
  ctaLabelShort,
  ctaLabelTight,
  className,
}: {
  ctaHref: string;
  ctaLabel: string;
  ctaLabelShort?: string;
  ctaLabelTight?: string;
  className?: string;
}) {
  const mobileLabel = ctaLabelTight ?? ctaLabelShort ?? ctaLabel;
  const mobileHidesArrow = Boolean(ctaLabelTight?.includes('→'));

  return (
    <Link href={ctaHref} className={cn(ctaButtonClass, className)} aria-label={ctaLabel}>
      <span className="hidden sm:inline">{ctaLabel}</span>
      <span className="inline max-w-[10.5rem] truncate text-left font-bold normal-case leading-tight tracking-normal sm:hidden">
        {mobileLabel}
      </span>
      <ArrowRight
        size={16}
        className={cn('shrink-0', mobileHidesArrow && 'hidden sm:inline-flex')}
        aria-hidden
      />
    </Link>
  );
}

export function PublicDarkSiteHeader({
  ctaLabel,
  ctaLabelShort,
  ctaLabelTight,
  ctaHref = '/register',
  showProSubscribe = false,
  showAvantProLink = true,
  showPlanosLink = true,
}: PublicDarkSiteHeaderProps) {
  const planosLink = showPlanosLink ? (
    <Link
      href="/planos"
      className={`${navLinkClass} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
    >
      <span className="sm:hidden">Concursos</span>
      <span className="hidden sm:inline">Concursos abertos</span>
    </Link>
  ) : null;

  const avantProLink = showAvantProLink ? (
    <Link
      href={AVANT_PRO_LP_HREF}
      className={`${navLinkClass} inline-flex shrink-0 px-1.5 py-1.5 text-[10px] min-[400px]:px-3 min-[400px]:py-2 min-[400px]:text-sm`}
    >
      AVANT Pro
    </Link>
  ) : null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-4">
          {/* Mobile: logo isolada na 1ª linha; nav na 2ª */}
          <div className="flex flex-col gap-2 sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <AvantLogo href="/" variant="icon" size="nav" className="min-w-0" />
              <div className="flex shrink-0 items-center gap-1">
                <Link href="/login" className={`${navLinkClassMobile} shrink-0`}>
                  Entrar
                </Link>
                <CtaButton
                  ctaHref={ctaHref}
                  ctaLabel={ctaLabel}
                  ctaLabelShort={ctaLabelShort}
                  ctaLabelTight={ctaLabelTight}
                  className="!px-2.5 !py-1.5 !text-[10px] min-[400px]:!text-xs"
                />
              </div>
            </div>
            <nav
              className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-white/5 pt-2"
              aria-label="Navegação secundária"
            >
              <Link href="/blog" className={navLinkClassMobile}>
                Blog
              </Link>
              {showPlanosLink ? (
                <Link href="/planos" className={navLinkClassMobile}>
                  Concursos abertos
                </Link>
              ) : null}
              {avantProLink ? (
                <Link href={AVANT_PRO_LP_HREF} className={navLinkClassMobile}>
                  AVANT Pro
                </Link>
              ) : null}
              {showProSubscribe ? <ProSubscribeNavButton /> : null}
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
              <Link href="/blog" className={`${navLinkClass} hidden min-[400px]:inline-flex shrink-0`}>
                Blog
              </Link>
              {planosLink}
              {avantProLink}
              <nav className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
                <Link href="/login" className={`${navLinkClass} shrink-0 px-2 min-[400px]:px-3`}>
                  Entrar
                </Link>
                {showProSubscribe ? <ProSubscribeNavButton /> : null}
                <CtaButton
                  ctaHref={ctaHref}
                  ctaLabel={ctaLabel}
                  ctaLabelShort={ctaLabelShort}
                  ctaLabelTight={ctaLabelTight}
                />
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className={HEADER_SPACER_CLASS} aria-hidden />
    </>
  );
}
