'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Pill, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  extractLetterFromLabel,
  inferCamTrapSlots,
  type CamChipColor,
} from '@/lib/slides/camSlideUtils';

const CHIP_STYLES: Record<CamChipColor, string> = {
  teal: 'bg-teal-100/90 text-teal-900 ring-teal-300/50',
  emerald: 'bg-emerald-100/90 text-emerald-900 ring-emerald-300/50',
  rose: 'bg-rose-100/90 text-rose-900 ring-rose-300/50',
  amber: 'bg-amber-100/90 text-amber-900 ring-amber-300/50',
  sky: 'bg-sky-100/90 text-sky-900 ring-sky-300/50',
};

function ThemeChipsRow({
  chips,
  revealed,
}: {
  chips: { label: string; color: CamChipColor }[];
  revealed: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`rounded-lg px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide ring-1 ${
            revealed ? CHIP_STYLES.emerald : CHIP_STYLES[chip.color]
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function LetterBadge({ letter }: { letter: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-teal-600 font-display text-lg font-black text-white shadow-sm">
      {letter}
    </div>
  );
}

function TrapCard({
  index,
  item,
  isRevealed,
  onReveal,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  isRevealed: boolean;
  onReveal: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { chips, hasChips } = inferCamTrapSlots(label, trapText, correctText);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isRevealed) onReveal();
    }
  };

  return (
    <motion.button
      type="button"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
      onClick={() => !isRevealed && onReveal()}
      onKeyDown={handleKeyDown}
      aria-expanded={isRevealed}
      className={`w-full overflow-hidden rounded-[1.25rem] border text-left transition-all ${
        isRevealed
          ? 'border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/40 to-white shadow-md'
          : 'border-rose-200/80 bg-white/95 shadow-sm hover:border-rose-300'
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {letter ? <LetterBadge letter={letter} /> : null}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-rose-700">Pegadinha</p>
            <p className="mt-1 font-display text-sm font-bold text-slate-900">
              {label.replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')}
            </p>
            {trapText ? (
              <p className="mt-1 line-clamp-2 font-body text-sm text-slate-600">{trapText}</p>
            ) : null}
          </div>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isRevealed ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isRevealed ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
          </span>
        </div>

        {hasChips ? <ThemeChipsRow chips={chips} revealed={isRevealed} /> : null}

        {isRevealed && correctText ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">Correto</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
          </motion.div>
        ) : !isRevealed ? (
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
            Toque para revelar a regra correta →
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

interface DangerZoneCamCertosTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneCamCertosTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneCamCertosTrapArenaProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  const handleReveal = useCallback(
    (index: number) => {
      if (isTapMode) revealItem(index);
    },
    [isTapMode, revealItem],
  );

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        {content ? (
          <div className="flex items-center justify-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-4 py-2 shadow-sm">
            <Pill className="h-4 w-4 text-teal-600" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-900">{content}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <TrapCard
              key={index}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => handleReveal(index)}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
