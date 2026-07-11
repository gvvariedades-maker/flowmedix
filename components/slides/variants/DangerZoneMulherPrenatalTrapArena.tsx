'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Heart, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferPrenatalTrapSlots,
  PRENATAL_TRIMESTER_SLOTS,
  prenatalTrimesterLabel,
  type PrenatalTrimesterSlot,
} from '@/lib/slides/mulherPrenatalSlideUtils';

function TrimesterRail({
  trapSlots,
  correctSlots,
  revealed,
}: {
  trapSlots: PrenatalTrimesterSlot[];
  correctSlots: PrenatalTrimesterSlot[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-pink-200/80 bg-pink-50/50 px-2 py-2"
      aria-hidden
    >
      {PRENATAL_TRIMESTER_SLOTS.map((slot) => {
        const isTrap = trapSlots.includes(slot);
        const isCorrect = correctSlots.includes(slot);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={slot}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`text-center font-mono text-[8px] font-black leading-tight sm:text-[9px] ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {prenatalTrimesterLabel(slot)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function LetterBadge({ letter }: { letter: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 font-display text-lg font-black text-white shadow-sm">
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
  const { trapTrimesters, correctTrimesters, hasRail } = inferPrenatalTrapSlots(label, trapText, correctText);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onReveal();
    }
  };

  return (
    <motion.button
      type="button"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
      onClick={onReveal}
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
            <p className="mt-1 font-display text-sm font-bold text-slate-900">{label.replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')}</p>
            {trapText ? (
              <p className="mt-1 font-body text-sm text-slate-600 line-clamp-2">{trapText}</p>
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

        {hasRail ? (
          <TrimesterRail trapSlots={trapTrimesters} correctSlots={correctTrimesters} revealed={isRevealed} />
        ) : null}

        {isRevealed && correctText ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">Correto</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
          </motion.div>
        ) : null}
      </div>
    </motion.button>
  );
}

interface DangerZoneMulherPrenatalTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneMulherPrenatalTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneMulherPrenatalTrapArenaProps) {
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
          <div className="flex items-center justify-center gap-2 rounded-full border border-pink-200/80 bg-white/80 px-4 py-2 shadow-sm">
            <Heart className="h-4 w-4 text-pink-500" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-pink-900">{content}</p>
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
