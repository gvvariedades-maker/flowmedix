'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LandingNeuroSlideLive } from '@/components/marketing/LandingNeuroSlideLive';
import {
  getLandingNeuroslideTypeMeta,
  LANDING_NEUROSLIDE_SLIDES,
} from '@/lib/marketing/landingNeuroSlides';
import {
  NEUROSLIDE_ASPECT_CLASS,
  NEUROSLIDE_MAX_WIDTH_CLASS,
} from '@/lib/marketing/neuroslideAssets';
import { cn } from '@/lib/utils';

export type NeuroSlideCarouselProps = {
  className?: string;
  /** Permite toque no fluxo lógico (tap) na demo embutida. */
  interactive?: boolean;
};

/** Carrossel com NeuroSlides reais do player — proporção fixa 487×1024, max 340px de largura. */
export function NeuroSlideCarousel({ className, interactive = false }: NeuroSlideCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = LANDING_NEUROSLIDE_SLIDES[active];
  const meta = getLandingNeuroslideTypeMeta(slide);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % LANDING_NEUROSLIDE_SLIDES.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative mx-auto w-full min-w-0 max-w-full justify-self-center',
        NEUROSLIDE_MAX_WIDTH_CLASS,
        className,
      )}
    >
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-cyan-400/10 blur-3xl sm:-inset-8" />
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_0_50px_rgba(0,242,255,0.12)] backdrop-blur-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full p-3 sm:p-4">
          {LANDING_NEUROSLIDE_SLIDES.map((s, i) => (
            <div
              key={`${s.type}-${i}`}
              className={
                i === active
                  ? cn('relative w-full', NEUROSLIDE_ASPECT_CLASS)
                  : cn(
                      'pointer-events-none absolute inset-x-3 top-3 w-[calc(100%-1.5rem)] opacity-0 sm:inset-x-4 sm:top-4 sm:w-[calc(100%-2rem)]',
                      NEUROSLIDE_ASPECT_CLASS,
                    )
              }
              aria-hidden={i !== active}
            >
              <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#f8fafc]">
                <LandingNeuroSlideLive slideIndex={i} interactive={interactive && i === active} />
              </div>
            </div>
          ))}
          <span
            className="absolute top-6 left-6 z-10 rounded-full border bg-black/60 px-3 py-1 text-xs font-black tracking-wider uppercase backdrop-blur-sm sm:top-7 sm:left-7"
            style={{ borderColor: meta.color, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <p className="px-4 py-3 text-sm text-slate-400">{meta.description}</p>
        <div
          className="flex justify-center gap-2 pb-4"
          role="tablist"
          aria-label="Slides do NeuroSlide"
        >
          {LANDING_NEUROSLIDE_SLIDES.map((s, i) => {
            const dotMeta = getLandingNeuroslideTypeMeta(s);
            return (
              <button
                key={`dot-${s.type}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1}: ${dotMeta.label}`}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'h-2 w-6 bg-[#F26522]' : 'h-2 w-2 bg-white/20'
                }`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
