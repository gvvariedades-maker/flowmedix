import type { Ref } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';

type VitrinePageHeaderProps = {
  title: string;
  description?: string | null;
  /** Permite foco programático ao mudar hub ↔ assuntos. */
  titleRef?: Ref<HTMLHeadingElement>;
};

export default function VitrinePageHeader({
  title,
  description,
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
              className={cn('text-[11px] font-medium hover:underline', vitrineBrand.text)}
            >
              Como funciona
            </Link>
          </div>
          <h1
            ref={titleRef}
            id="vitrine-page-title"
            tabIndex={-1}
            className="text-editorial-title text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-[#0cc93a]/40 focus-visible:ring-offset-2 sm:text-3xl"
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-xs tabular-nums text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
