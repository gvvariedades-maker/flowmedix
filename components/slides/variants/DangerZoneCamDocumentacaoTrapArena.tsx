'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ClipboardList, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  extractLetterFromLabel,
  type CamChipColor,
} from '@/lib/slides/camSlideUtils';
import { inferCamDocumentacaoTrapSlots } from '@/lib/slides/camDocumentacaoSlideUtils';

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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 font-display text-lg font-black text-white shadow-sm">
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
  const { chips, hasChips } = inferCamDocumentacaoTrapSlots(label, trapText, correctText);

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
          : 'border-cyan-200/80 bg-white/95 shadow-sm hover:border-cyan-300'
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {letter ? <LetterBadge letter={letter} /> : null}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-cyan-700">Registro</p>
            <p className="font-body text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-1 font-body text-sm text-slate-600">{trapText}</p>
          </div>
        </div>
        {hasChips ? <ThemeChipsRow chips={chips} revealed={isRevealed} /> : null}
        {isRevealed && correctText ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <p className="font-body text-sm font-medium text-emerald-900">{correctText}</p>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase text-rose-600">
            <X className="h-3 w-3" aria-hidden />
            toque para revelar
          </span>
        )}
      </div>
    </motion.button>
  );
}

interface DangerZoneCamDocumentacaoTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneCamDocumentacaoTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneCamDocumentacaoTrapArenaProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed } = useDangerZoneCompareReveal(items.length, compareRevealMode);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-900 shadow-sm">
            <ClipboardList className="h-3 w-3" aria-hidden />
            Documentação Trap Arena
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <TrapCard
              key={index}
              index={index}
              item={item}
              isRevealed={isItemRevealed(index)}
              onReveal={() => revealItem(index)}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
