'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Baby, Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import { inferPuerperioTrapSlots } from '@/lib/slides/mulherPuerperioSlideUtils';

const PUERPERIO_DAY_MARKERS = [0, 7, 42] as const;

function DayTrapRuler({
  trapDay,
  correctDay,
  revealed,
}: {
  trapDay: number | null;
  correctDay: number | null;
  revealed: boolean;
}) {
  const min = 0;
  const max = 42;
  const toPct = (day: number) => `${Math.min(100, Math.max(0, ((day - min) / (max - min)) * 100))}%`;

  return (
    <div className="rounded-xl border border-pink-200/80 bg-pink-50/50 p-3">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-slate-200 via-pink-300 to-slate-300">
        {trapDay !== null && !revealed ? (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 ring-2 ring-rose-300/60"
            style={{ left: toPct(trapDay) }}
          />
        ) : null}
        {correctDay !== null && revealed ? (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 ring-2 ring-emerald-300/60"
            style={{ left: toPct(correctDay) }}
          />
        ) : null}
        <span className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/30" style={{ left: toPct(7) }} />
        <span className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/30" style={{ left: toPct(42) }} />
      </div>
      <div className="mt-2 flex justify-between">
        {PUERPERIO_DAY_MARKERS.map((day) => (
          <span
            key={day}
            className={`font-mono text-[9px] font-bold ${
              trapDay === day && !revealed
                ? 'text-rose-700'
                : correctDay === day && revealed
                  ? 'text-emerald-700'
                  : 'text-slate-500'
            }`}
          >
            {day}
          </span>
        ))}
      </div>
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
  const { trapDay, correctDay, hasRail } = inferPuerperioTrapSlots(label, trapText, correctText);

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
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-rose-700">
              Marco temporal errado
            </p>
            <p className="mt-1 font-display text-sm font-bold text-slate-900">
              {label.replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')}
            </p>
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
          <DayTrapRuler trapDay={trapDay} correctDay={correctDay} revealed={isRevealed} />
        ) : null}

        {isRevealed && correctText ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              MS/AB — posição correta
            </p>
            <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
          </motion.div>
        ) : null}
      </div>
    </motion.button>
  );
}

interface DangerZoneMulherPuerperioTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneMulherPuerperioTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneMulherPuerperioTrapArenaProps) {
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
            <Baby className="h-4 w-4 text-pink-500" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-pink-900">
              {content}
            </p>
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
