'use client';

import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { formatCatalogCount } from '@/lib/vitrine/catalogStatsAnimation';
import { useCatalogStatsCountUp } from '@/hooks/useCatalogStatsCountUp';

type VitrineCatalogStatsStripProps = {
  totalQuestions: number;
  totalSlides: number;
};

export default function VitrineCatalogStatsStrip({
  totalQuestions,
  totalSlides,
}: VitrineCatalogStatsStripProps) {
  const { totalQuestions: displayQuestions, totalSlides: displaySlides, ready, animating } =
    useCatalogStatsCountUp(totalQuestions, totalSlides);

  return (
    <div
      data-testid="vitrine-catalog-stats"
      data-vitrine-stats-ready={ready ? 'true' : 'false'}
      data-vitrine-stats-animating={animating ? 'true' : 'false'}
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
      aria-label="Totais do catálogo"
      aria-busy={animating || undefined}
    >
      <div className="flex items-baseline gap-2">
        <strong className={cn('text-2xl font-black tabular-nums leading-none', vitrineBrand.text)}>
          {formatCatalogCount(displayQuestions)}
        </strong>
        <span className="text-xs text-slate-500">questões com estudo reverso</span>
      </div>
      <div className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
      <div className="flex items-baseline gap-2">
        <strong className={cn('text-2xl font-black tabular-nums leading-none', vitrineBrand.text)}>
          {formatCatalogCount(displaySlides)}
        </strong>
        <span className="text-xs text-slate-500">NeuroSlides</span>
      </div>
    </div>
  );
}
