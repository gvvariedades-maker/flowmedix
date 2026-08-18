import type { ReactNode, Ref } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';

type VitrinePageHeaderProps = {
  title: string;
  description?: string | null;
  /** Totais do catálogo — linha de apoio sob o H1 (sem card próprio). */
  stats?: ReactNode;
  /** Permite foco programático ao mudar hub ↔ assuntos. */
  titleRef?: Ref<HTMLHeadingElement>;
};

export default function VitrinePageHeader({
  title,
  description,
  stats,
  titleRef,
}: VitrinePageHeaderProps) {
  return (
    <section aria-labelledby="vitrine-page-title">
      <div className="flex items-stretch gap-3">
        <div className={cn('w-1 shrink-0 rounded-full', vitrineBrand.bg)} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Estudo reverso
            </p>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link
              href="/ajuda/estudo-reverso"
              className={cn(
                /* min-h 44px — alvo de toque; rótulo permanece terciário. */
                'inline-flex min-h-11 items-center px-1 text-[11px] font-medium hover:underline',
                vitrineBrand.text,
                vitrineBrand.focusRing,
              )}
            >
              Como funciona
            </Link>
          </div>
          <h1
            ref={titleRef}
            id="vitrine-page-title"
            tabIndex={-1}
            className={cn(
              /* ~27–30px mobile / ~36px desktop (escala +20% sobre 2xl/3xl). */
              'text-editorial-title text-[1.7rem] font-bold leading-tight outline-none sm:text-[2.25rem]',
              vitrineBrand.focusRingOffset,
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-xs tabular-nums text-slate-500">{description}</p>
          ) : null}
          {stats ? <div className="mt-1.5">{stats}</div> : null}
        </div>
      </div>
    </section>
  );
}
