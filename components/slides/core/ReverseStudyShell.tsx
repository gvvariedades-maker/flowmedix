'use client';

import React from 'react';
import { GitBranch, Network, ScanText, ShieldAlert, Sparkles, Swords } from 'lucide-react';
import { getSlideArcLabel, getSlideChipLabel } from './slideLabels';
import type { SlideType } from '@/types/lesson';
import type { ThemeColors } from './themeGenerator';

type ChipConfig = {
  badge: string;
  iconClass: string;
};

const CHIP_CONFIG: Record<SlideType, ChipConfig> = {
  concept_map: {
    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    iconClass: 'text-cyan-600',
  },
  golden_rule: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    iconClass: 'text-amber-600',
  },
  logic_flow: {
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    iconClass: 'text-violet-600',
  },
  danger_zone: {
    badge: 'bg-red-50 text-red-700 ring-red-200',
    iconClass: 'text-red-600',
  },
  syllable_scanner: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    iconClass: 'text-emerald-600',
  },
  versus_arena: {
    badge: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
    iconClass: 'text-fuchsia-600',
  },
};

const CHIP_CONFIG_FALLBACK: ChipConfig = {
  badge: 'bg-slate-50 text-slate-600 ring-slate-200',
  iconClass: 'text-slate-500',
};

function getChipConfig(slideType: string | undefined): ChipConfig {
  if (slideType && slideType in CHIP_CONFIG) {
    return CHIP_CONFIG[slideType as SlideType];
  }
  return CHIP_CONFIG_FALLBACK;
}

function getHeaderBorderClass(slideType: string | undefined): string {
  switch (slideType) {
    case 'concept_map':
      return 'border-cyan-200';
    case 'golden_rule':
      return 'border-amber-200';
    case 'logic_flow':
      return 'border-violet-200';
    case 'danger_zone':
      return 'border-red-200';
    case 'syllable_scanner':
      return 'border-emerald-200';
    case 'versus_arena':
      return 'border-fuchsia-200';
    default:
      return 'border-slate-200';
  }
}

export interface ReverseStudyShellProps {
  slideType: string | undefined;
  chipLabel?: string;
  slideTitle?: string;
  slideIndex: number;
  totalSlides: number;
  banca?: string;
  /** Cor do subtópico — chip usa tema exceto em danger_zone (vermelho fixo). */
  theme?: Pick<ThemeColors, 'iconBg' | 'iconText' | 'borderColor' | 'glow'>;
  children: React.ReactNode;
}

/**
 * Shell único do estudo reverso: chip de tipo, badge de banca, título opcional e fio condutor.
 * Uso interno — montado apenas por `NeuroSlide` quando há `shellContext` ou `standalone`.
 */
function SlideTypeIcon({
  slideType,
  className,
}: {
  slideType: string | undefined;
  className: string;
}) {
  switch (slideType) {
    case 'concept_map':
      return <Network size={11} className={className} aria-hidden />;
    case 'golden_rule':
      return <Sparkles size={11} className={className} aria-hidden />;
    case 'logic_flow':
      return <GitBranch size={11} className={className} aria-hidden />;
    case 'danger_zone':
      return <ShieldAlert size={11} className={className} aria-hidden />;
    case 'syllable_scanner':
      return <ScanText size={11} className={className} aria-hidden />;
    case 'versus_arena':
      return <Swords size={11} className={className} aria-hidden />;
    default:
      return null;
  }
}

function resolveChipPresentation(
  slideType: string | undefined,
  theme?: Pick<ThemeColors, 'iconBg' | 'iconText' | 'borderColor' | 'glow'>,
): { badge: string; iconClass: string; border: string } {
  const fallback = getChipConfig(slideType);
  if (!theme || slideType === 'danger_zone') {
    return {
      badge: fallback.badge,
      iconClass: fallback.iconClass,
      border: getHeaderBorderClass(slideType),
    };
  }
  return {
    badge: `${theme.iconBg} ${theme.iconText} ring-1 ring-slate-200`,
    iconClass: theme.iconText,
    border: `border-b ${theme.borderColor}`,
  };
}

export function ReverseStudyShell({
  slideType,
  chipLabel,
  slideTitle,
  slideIndex,
  totalSlides,
  banca,
  theme,
  children,
}: ReverseStudyShellProps) {
  const chipText = getSlideChipLabel(slideType, chipLabel);
  const arcLabel = getSlideArcLabel(slideType, slideIndex, totalSlides);
  const positionLabel = `Slide ${slideIndex + 1} de ${totalSlides}`;
  const chipConf = resolveChipPresentation(slideType, theme);
  const iconClassName = ['shrink-0', chipConf.iconClass].join(' ');

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <header
        className={[
          'mb-3 w-full shrink-0 space-y-2 self-stretch',
          'border-b px-1 pb-3 sm:mb-4',
          theme && slideType !== 'danger_zone' ? chipConf.border : `border-b ${getHeaderBorderClass(slideType)}`,
        ].join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={[
              'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-widest ring-1',
              chipConf.badge,
            ].join(' ')}
            aria-label={`Tipo de slide: ${chipText}`}
          >
            <SlideTypeIcon slideType={slideType} className={iconClassName} />
            <span className="truncate">{chipText}</span>
          </span>
          {banca?.trim() ? (
            <span
              className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500"
              title={banca.trim()}
            >
              {banca.trim()}
            </span>
          ) : null}
        </div>

        {slideTitle?.trim() ? (
          <h2 className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-slate-900 sm:text-base md:text-lg">
            {slideTitle.trim()}
          </h2>
        ) : null}

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
          <span className="font-mono tabular-nums text-slate-600">{positionLabel}</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            —
          </span>
          <span className="font-body normal-case tracking-normal text-slate-500">{arcLabel}</span>
        </p>
      </header>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-100">
        {children}
      </div>
    </div>
  );
}
