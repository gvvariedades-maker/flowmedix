'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Clock, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { extractHoursFromText } from '@/lib/slides/puncaoBranchSlideUtils';

export function DangerZoneIvIntervalSwapTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(
    () =>
      items.map((item, index) => {
        const label = item.label || `Item ${index + 1}`;
        const detail = item.detail || '';
        const correct = typeof item.correct === 'string' ? item.correct : '';
        return {
          label,
          detail,
          correct,
          trapH: extractHoursFromText(`${label} ${detail}`),
          correctH: extractHoursFromText(correct),
          index,
        };
      }),
    [items],
  );
  const { revealItem: reveal, isItemRevealed: isRevealed } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-sky-900 shadow-sm">
          <Clock className="h-3 w-3" aria-hidden />
          Interval Swap
        </span>
        {content ? <p className="text-sm font-semibold text-slate-800">{content}</p> : null}
        {entries.map((entry) => {
          const revealed = isRevealed(entry.index);
          return (
            <button
              key={entry.index}
              type="button"
              onClick={() => !revealed && reveal(entry.index)}
              className="min-h-[44px] w-full text-left"
            >
              <div
                className={`rounded-2xl border p-4 ${
                  revealed ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/50'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {revealed ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />}
                  {entry.trapH ? (
                    <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-xs font-bold text-rose-800">
                      {entry.trapH}h
                    </span>
                  ) : null}
                  {revealed && entry.correctH ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800">
                      → {entry.correctH}h
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-bold text-slate-900">{entry.label}</p>
                <p className="mt-1 text-sm text-slate-600">{entry.detail}</p>
                {revealed ? (
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 border-t border-emerald-200 pt-2 text-sm font-semibold text-emerald-900"
                  >
                    {entry.correct}
                  </motion.p>
                ) : null}
              </div>
            </button>
          );
        })}
        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center text-sm italic ${theme.borderColor}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
