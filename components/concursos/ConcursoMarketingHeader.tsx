import Link from 'next/link';
import type { ReactNode } from 'react';
import { Zap } from 'lucide-react';

/** Mesmo estilo do link "Entrar" no header da landing. */
const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white';

const PRO_REGISTER_HREF = '/register?next=/estudar';

export type ConcursoMarketingHeaderProps = {
  ariaLabel?: string;
  trailingCta?: ReactNode;
};

export function ConcursoMarketingHeader({
  ariaLabel = 'AVANT',
  trailingCta,
}: ConcursoMarketingHeaderProps) {
  return (
    <header className="relative z-20 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
            aria-label={ariaLabel}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="shrink-0 text-xl font-[1000] italic tracking-tighter text-white">
              AVANT
            </span>
          </Link>
          {trailingCta ? <div className="shrink-0 sm:hidden">{trailingCta}</div> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
          <nav
            className="flex flex-wrap items-center gap-0.5 sm:gap-1"
            aria-label="Navegação do concurso"
          >
            <Link href="/planos" className={`${navLinkClass} shrink-0 px-2 sm:px-3`}>
              Pacotes
            </Link>
            <Link
              href={PRO_REGISTER_HREF}
              className={`${navLinkClass} shrink-0 px-2 text-xs sm:px-3 sm:text-sm`}
            >
              Comece grátis no Pro
            </Link>
          </nav>
          {trailingCta ? <div className="hidden shrink-0 sm:block">{trailingCta}</div> : null}
        </div>
      </div>
    </header>
  );
}
