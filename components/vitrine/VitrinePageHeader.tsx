import Link from 'next/link';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';

type VitrinePageHeaderProps = {
  title: string;
  description?: string | null;
};

export default function VitrinePageHeader({ title, description }: VitrinePageHeaderProps) {
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
            id="vitrine-page-title"
            className="text-editorial-title text-2xl font-bold sm:text-3xl"
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
