'use client';

import React from 'react';
import { getSlideArcLabel, getSlideChipLabel } from './slideLabels';
import type { SlideType } from '@/types/lesson';

const CHIP_BADGE_CLASS: Record<SlideType, string> = {
  concept_map: 'bg-cyan-400/20 text-cyan-300 ring-cyan-400/25',
  golden_rule: 'bg-amber-400/20 text-amber-300 ring-amber-400/25',
  logic_flow: 'bg-violet-400/20 text-violet-300 ring-violet-400/25',
  danger_zone: 'bg-red-400/20 text-red-300 ring-red-400/25',
  syllable_scanner: 'bg-emerald-400/20 text-emerald-300 ring-emerald-400/25',
  versus_arena: 'bg-fuchsia-400/20 text-fuchsia-300 ring-fuchsia-400/25',
};

function chipBadgeClass(slideType: string | undefined): string {
  if (slideType && slideType in CHIP_BADGE_CLASS) {
    return CHIP_BADGE_CLASS[slideType as SlideType];
  }
  return 'bg-white/10 text-white/80 ring-white/15';
}

export interface ReverseStudyShellProps {
  slideType: string | undefined;
  chipLabel?: string;
  slideTitle?: string;
  slideIndex: number;
  totalSlides: number;
  banca?: string;
  children: React.ReactNode;
}

/**
 * Shell único do estudo reverso: chip de tipo, badge de banca, título opcional e fio condutor.
 * Uso interno — montado apenas por `NeuroSlide` quando há `shellContext` ou `standalone`.
 */
export function ReverseStudyShell({
  slideType,
  chipLabel,
  slideTitle,
  slideIndex,
  totalSlides,
  banca,
  children,
}: ReverseStudyShellProps) {
  const chipText = getSlideChipLabel(slideType, chipLabel);
  const arcLabel = getSlideArcLabel(slideType, slideIndex, totalSlides);
  const positionLabel = `Slide ${slideIndex + 1} de ${totalSlides}`;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <header className="mb-4 w-full max-w-5xl shrink-0 space-y-2 self-center px-1 sm:mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={[
              'inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1',
              chipBadgeClass(slideType),
            ].join(' ')}
            aria-label={`Tipo de slide: ${chipText}`}
          >
            {chipText}
          </span>
          {banca?.trim() ? (
            <span
              className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center truncate rounded-full border border-white/15 bg-slate-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70 backdrop-blur-sm"
              title={banca.trim()}
            >
              {banca.trim()}
            </span>
          ) : null}
        </div>

        {slideTitle?.trim() ? (
          <h2 className="text-sm font-black uppercase leading-tight tracking-tight text-white sm:text-base md:text-lg">
            {slideTitle.trim()}
          </h2>
        ) : null}

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:text-[11px]">
          <span className="tabular-nums text-white/55">{positionLabel}</span>
          <span className="mx-2 text-white/25" aria-hidden>
            —
          </span>
          <span>{arcLabel}</span>
        </p>
      </header>

      <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
