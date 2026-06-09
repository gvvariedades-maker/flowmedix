'use client';

import React from 'react';
import { GitBranch, Network, ScanText, ShieldAlert, Sparkles, Swords } from 'lucide-react';
import { getSlideArcLabel, getSlideChipLabel } from './slideLabels';
import type { SlideType } from '@/types/lesson';
import type { ThemeColors } from './themeGenerator';

type ChipConfig = {
  badge: string;
  glow: string;
  iconClass: string;
};

const CHIP_CONFIG: Record<SlideType, ChipConfig> = {
  concept_map: {
    badge: 'bg-cyan-400/15 text-cyan-300 ring-cyan-400/25',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.25)]',
    iconClass: 'text-cyan-300',
  },
  golden_rule: {
    badge: 'bg-amber-400/15 text-amber-300 ring-amber-400/25',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.25)]',
    iconClass: 'text-amber-300',
  },
  logic_flow: {
    badge: 'bg-violet-400/15 text-violet-300 ring-violet-400/25',
    glow: 'shadow-[0_0_12px_rgba(167,139,250,0.25)]',
    iconClass: 'text-violet-300',
  },
  danger_zone: {
    badge: 'bg-red-400/15 text-red-300 ring-red-400/25',
    glow: 'shadow-[0_0_12px_rgba(248,113,113,0.25)]',
    iconClass: 'text-red-300',
  },
  syllable_scanner: {
    badge: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/25',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.25)]',
    iconClass: 'text-emerald-300',
  },
  versus_arena: {
    badge: 'bg-fuchsia-400/15 text-fuchsia-300 ring-fuchsia-400/25',
    glow: 'shadow-[0_0_12px_rgba(232,121,249,0.25)]',
    iconClass: 'text-fuchsia-300',
  },
};

const CHIP_CONFIG_FALLBACK: ChipConfig = {
  badge: 'bg-white/10 text-white/80 ring-white/15',
  glow: '',
  iconClass: 'text-white/80',
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
      return 'border-cyan-500/10';
    case 'golden_rule':
      return 'border-amber-500/10';
    case 'logic_flow':
      return 'border-violet-500/10';
    case 'danger_zone':
      return 'border-red-500/10';
    case 'syllable_scanner':
      return 'border-emerald-500/10';
    case 'versus_arena':
      return 'border-fuchsia-500/10';
    default:
      return 'border-white/5';
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
): { badge: string; glow: string; iconClass: string; border: string; glowStyle?: string } {
  const fallback = getChipConfig(slideType);
  if (!theme || slideType === 'danger_zone') {
    return {
      badge: fallback.badge,
      glow: fallback.glow,
      iconClass: fallback.iconClass,
      border: getHeaderBorderClass(slideType),
    };
  }
  return {
    badge: `${theme.iconBg} ${theme.iconText} ring-1 ring-white/10`,
    glow: '',
    glowStyle: `0 0 14px ${theme.glow}`,
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
          theme && slideType !== 'danger_zone' ? chipConf.border : getHeaderBorderClass(slideType),
        ].join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={[
              'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-widest ring-1',
              chipConf.badge,
              chipConf.glow,
            ].join(' ')}
            style={chipConf.glowStyle ? { boxShadow: chipConf.glowStyle } : undefined}
            aria-label={`Tipo de slide: ${chipText}`}
          >
            <SlideTypeIcon slideType={slideType} className={iconClassName} />
            <span className="truncate">{chipText}</span>
          </span>
          {banca?.trim() ? (
            <span
              className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
              title={banca.trim()}
            >
              {banca.trim()}
            </span>
          ) : null}
        </div>

        {slideTitle?.trim() ? (
          <h2 className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white sm:text-base md:text-lg">
            {slideTitle.trim()}
          </h2>
        ) : null}

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:text-[11px]">
          <span className="font-mono tabular-nums text-white/55">{positionLabel}</span>
          <span className="mx-2 text-white/25" aria-hidden>
            —
          </span>
          <span className="font-body">{arcLabel}</span>
        </p>
      </header>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
