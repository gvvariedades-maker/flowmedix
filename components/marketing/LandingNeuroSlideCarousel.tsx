'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LandingDemoJourneyChip } from '@/components/marketing/LandingDemoJourneyChip';
import {
  LANDING_NEUROSLIDE_SLIDES,
  getLandingNeuroslideTypeMeta,
} from '@/lib/marketing/landingNeuroSlides';
import { NEUROSLIDE_ASPECT_CLASS } from '@/lib/marketing/neuroslideAssets';
import { cn } from '@/lib/utils';

const LandingNeuroSlideLive = dynamic(
  () =>
    import('@/components/marketing/LandingNeuroSlideLive').then((m) => ({
      default: m.LandingNeuroSlideLive,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
        Carregando…
      </div>
    ),
  },
);

const ROTATE_MS = 5000;

/** Carrossel compacto com proporção real do player — cabe no card do método. */
export function LandingNeuroSlideCarousel({ className }: { className?: string }) {
  const total = LANDING_NEUROSLIDE_SLIDES.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [total]);

  const slide = LANDING_NEUROSLIDE_SLIDES[index];
  const meta = getLandingNeuroslideTypeMeta(slide);

  return (
    <div className={cn('flex h-full flex-col bg-[#0f172a]', className)} aria-hidden>
      <LandingDemoJourneyChip className="border-white/10 bg-white/5 [&_p]:text-slate-300" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-3 py-3">
        <span
          className="rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ borderColor: `${meta.color}55`, color: meta.color }}
        >
          {meta.label}
        </span>
        <div
          className={cn(
            'relative w-full max-w-[168px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#f8fafc] shadow-[0_0_24px_rgba(0,242,255,0.12)]',
            NEUROSLIDE_ASPECT_CLASS,
          )}
        >
          <LandingNeuroSlideLive key={index} slideIndex={index} className="absolute inset-0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tabular-nums text-slate-500">
            {index + 1}/{total}
          </span>
          <div className="flex gap-1">
            {LANDING_NEUROSLIDE_SLIDES.map((_, slideIndex) => (
              <span
                key={slideIndex}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  slideIndex === index ? 'w-4 bg-[#8fe020]' : 'w-1.5 bg-white/25',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
