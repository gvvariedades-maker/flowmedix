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
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-slate-500"
      aria-label="Totais do catálogo"
      aria-busy={animating || undefined}
    >
      <span className="inline-flex items-baseline gap-1.5">
        <strong
          className={cn('font-display text-sm font-bold tabular-nums leading-none', vitrineBrand.text)}
        >
          {formatCatalogCount(displaySlides)}
        </strong>
        <span>NeuroSlides</span>
      </span>
      <span className="text-slate-300" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-baseline gap-1.5">
        <strong
          className={cn('font-display text-sm font-bold tabular-nums leading-none', vitrineBrand.text)}
        >
          {formatCatalogCount(displayQuestions)}
        </strong>
        <span>questões com estudo reverso</span>
      </span>
    </div>
  );
}
