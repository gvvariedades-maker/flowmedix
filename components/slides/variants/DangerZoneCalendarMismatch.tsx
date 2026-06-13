'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarX, Check, Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';

const PNI_MONTHS = [0, 2, 3, 4, 6, 12] as const;

type MonthSlot = (typeof PNI_MONTHS)[number];

function monthLabel(month: MonthSlot): string {
  return month === 0 ? '0' : `${month}M`;
}

function extractMonths(text: string): number[] {
  const lower = text.toLowerCase();
  const found = new Set<number>();
  if (/ao nascer|nascimento|neonatal/.test(lower)) found.add(0);
  for (const match of lower.matchAll(/(\d+)\s*(?:º|o)?\s*m[eê]s/g)) {
    const n = Number.parseInt(match[1], 10);
    if (PNI_MONTHS.includes(n as MonthSlot)) found.add(n);
  }
  if (/3-5-12|3 · 5 · 12|3, 5 e 12/.test(lower)) {
    found.add(3);
    found.add(5);
    found.add(12);
  }
  if (/2, 4 e 12|2 · 4 · 12|2 e 4 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    if (/12/.test(lower)) found.add(12);
  }
  if (/2, 4 e 6|2-4-6|2, 4 e 6 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    found.add(6);
  }
  return [...found];
}

function inferCalendarSlots(
  label: string,
  detail: string,
  correct: string,
): { trapMonths: number[]; correctMonths: number[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (/acwy|atraso|catch-up|pular dose|esperar próximo/.test(trapText + correctText)) {
    return { trapMonths: [], correctMonths: [], hasRail: false };
  }

  let trapMonths = extractMonths(`${label} ${detail}`);
  let correctMonths = extractMonths(correct);

  if (trapMonths.length === 0 && /3\s*m/.test(trapText)) trapMonths = [3];
  if (/bcg/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [0];
  }
  if (/rotav/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4];
  }
  if (/pneumo/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 12];
  }
  if (/difteria|pentavalente|dtp/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 6];
  }
  if (/meningo|men c/.test(trapText) && !/acwy/.test(trapText)) {
    if (trapMonths.length === 0 && /3/.test(trapText)) trapMonths = [3];
    if (correctMonths.length === 0) correctMonths = [3, 5, 12];
  }
  if (/3ª dose/.test(trapText)) {
    trapMonths = [3];
    correctMonths = correctMonths.length > 0 ? correctMonths : [6];
  }

  return {
    trapMonths,
    correctMonths,
    hasRail: trapMonths.length > 0 || correctMonths.length > 0,
  };
}

function MonthRail({
  trapMonths,
  correctMonths,
  revealed,
}: {
  trapMonths: number[];
  correctMonths: number[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-lime-200/80 bg-lime-50/50 px-2 py-2"
      aria-hidden
    >
      {PNI_MONTHS.map((month) => {
        const isTrap = trapMonths.includes(month);
        const isCorrect = correctMonths.includes(month);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={month}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`font-mono text-[9px] font-black tabular-nums ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {monthLabel(month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CalendarMismatchCard({
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
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapMonths, correctMonths, hasRail } = inferCalendarSlots(label, trapText, correctText);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isRevealed) onReveal();
    }
  };

  return (
    <button
      type="button"
      onClick={() => !isRevealed && onReveal()}
      onKeyDown={handleKeyDown}
      aria-pressed={isRevealed}
      className={`w-full text-left transition-transform duration-200 ${
        !isRevealed ? 'hover:scale-[1.01]' : ''
      }`}
    >
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isRevealed
            ? 'border-emerald-200/80 border-l-[3px] border-l-emerald-400/80 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-50/70'
            : 'border-rose-200/80 border-l-[3px] border-l-rose-400/80 bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70'
        }`}
      >
        <div className="grid grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-700' : 'bg-rose-100/90 text-rose-700'
              }`}
            >
              {isRevealed ? (
                <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
              ) : (
                <CalendarX className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              )}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                isRevealed ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
              }`}
            >
              {isRevealed ? 'PNI corrigido' : `erro #${index + 1}`}
            </span>
          </div>

          {hasRail ? (
            <MonthRail trapMonths={trapMonths} correctMonths={correctMonths} revealed={isRevealed} />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-lime-200/70 bg-lime-50/60 px-3 py-2">
              <Syringe className="h-4 w-4 shrink-0 text-lime-700" aria-hidden />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-lime-800">
                transferência de prova
              </span>
            </div>
          )}

          <div className="min-h-0">
            <p className="line-clamp-2 font-display text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {label}
            </p>
            <p className="mt-1.5 line-clamp-2 font-body text-sm font-semibold leading-snug text-slate-700">
              {trapText}
            </p>
          </div>

          {isRevealed ? (
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-emerald-200/60 pt-2 font-body text-sm font-bold leading-snug text-emerald-900"
            >
              {correctText || '—'}
            </motion.p>
          ) : (
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
              Toque para alinhar no calendário →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface DangerZoneCalendarMismatchProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZoneCalendarMismatch({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'auto',
}: DangerZoneCalendarMismatchProps) {
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

  const revealedCount = items.filter((_, i) => isItemRevealed(i)).length;
  const allRevealed = revealedCount >= items.length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col">
        {content ? (
          <div className="mb-4 flex justify-center">
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p
                className={`font-display text-center text-xs font-extrabold uppercase tracking-[0.12em] md:text-sm ${theme.iconText}`}
              >
                {content}
              </p>
            </div>
          </div>
        ) : null}

        <p className="mb-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs ${theme.borderColor}`}
          >
            <span className={`font-body ${theme.textSecondary}`}>Corrigidos no PNI:</span>
            <strong className={`font-mono text-sm font-black tabular-nums ${theme.iconText}`}>
              {revealedCount}
            </strong>
            <span className={`font-body ${theme.textSecondary}`}>/ {items.length}</span>
          </span>
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CalendarMismatchCard
                  index={index}
                  item={item}
                  isRevealed={isItemRevealed(index)}
                  onReveal={() => handleReveal(index)}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </motion.div>
            ))}
        </div>

        {footerRule ? (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 md:px-5 md:py-4 ${theme.borderColor} ${theme.iconBg}`}
          >
            <p
              className={`font-body text-center text-sm font-semibold leading-relaxed md:text-base ${theme.textSecondary}`}
            >
              {footerRule}
            </p>
          </div>
        ) : null}

        {allRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-lime-200/80 bg-lime-50/80 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-lime-800">
              {isTapMode ? 'Calendário PNI dominado — revise os marcos 2 · 3 · 4 · 6 · 12' : 'Revise os marcos antes da prova'}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
