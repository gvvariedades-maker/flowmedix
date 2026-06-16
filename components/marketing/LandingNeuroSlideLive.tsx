'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import {
  LANDING_NEUROSLIDE_SLIDES,
  LANDING_NEUROSLIDE_SLUG,
} from '@/lib/marketing/landingNeuroSlides';

const NeuroSlide = dynamic(() => import('@/components/slides/NeuroSlide'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-slate-500">
      Carregando slide…
    </div>
  ),
});

type LandingNeuroSlideLiveProps = {
  slideIndex: number;
  className?: string;
  /** Desliga interação (hero/LP decorativo). */
  interactive?: boolean;
};

/** Renderiza um NeuroSlide real da questão demo (formato novo: tap, compare, rows). */
export function LandingNeuroSlideLive({
  slideIndex,
  className,
  interactive = false,
}: LandingNeuroSlideLiveProps) {
  const slide = LANDING_NEUROSLIDE_SLIDES[slideIndex];
  const totalSlides = LANDING_NEUROSLIDE_SLIDES.length;

  if (!slide) {
    return (
      <div className={cn('flex items-center justify-center bg-[#f8fafc] p-6 text-sm text-slate-500', className)}>
        Slide indisponível
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden bg-[#f8fafc]',
        !interactive && 'pointer-events-none select-none',
        className,
      )}
      aria-hidden={!interactive}
    >
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NeuroSlide
          data={slide}
          questionHash={LANDING_NEUROSLIDE_SLUG}
          questionSlug={LANDING_NEUROSLIDE_SLUG}
          slideIndex={slideIndex}
          shellContext={{
            slideIndex,
            totalSlides,
          }}
        />
      </div>
    </div>
  );
}
