'use client';

import Link from 'next/link';
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
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
      aria-label="Totais do catálogo"
      aria-busy={animating || undefined}
    >
      <div className="flex items-baseline gap-1.5">
        <strong className="text-lg font-black tabular-nums leading-none text-[#3d6b0f]">
          {formatCatalogCount(displayQuestions)}
        </strong>
        <span className="text-xs text-slate-500">questões com estudo reverso</span>
      </div>
      <span className="hidden text-slate-200 sm:block" aria-hidden>|</span>
      <div className="flex items-baseline gap-1.5">
        <strong className="text-lg font-black tabular-nums leading-none text-slate-700">
          {formatCatalogCount(displaySlides)}
        </strong>
        <span className="text-xs text-slate-500">NeuroSlides</span>
      </div>
      <Link
        href="/ajuda/estudo-reverso"
        className="ml-auto text-xs font-medium text-[#3d6b0f] hover:underline"
      >
        Como funciona
      </Link>
    </div>
  );
}
