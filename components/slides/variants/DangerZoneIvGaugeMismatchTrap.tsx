'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Syringe, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import { extractGaugeFromText } from '@/lib/slides/puncaoBranchSlideUtils';

interface DangerZoneIvGaugeMismatchTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

function GaugeChip({ gauge, highlight }: { gauge: number | null; highlight: 'trap' | 'correct' | 'none' }) {
  if (!gauge) return null;
  const styles =
    highlight === 'trap'
      ? 'bg-rose-200 ring-rose-400 text-rose-900'
      : highlight === 'correct'
        ? 'bg-emerald-200 ring-emerald-400 text-emerald-900'
        : 'bg-slate-100 text-slate-600';
  return (
    <span className={`rounded-lg px-2 py-1 font-mono text-xs font-black ring-2 ${styles}`}>{gauge}G</span>
  );
}

export function DangerZoneIvGaugeMismatchTrap({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneIvGaugeMismatchTrapProps) {
  const reduceMotion = useReducedMotion();
  const { revealItem: reveal, isItemRevealed: isRevealed } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-900 shadow-sm">
          <Syringe className="h-3 w-3" aria-hidden />
          Gauge Mismatch
        </span>
        {content ? <p className="font-body text-sm font-semibold text-slate-800">{content}</p> : null}
        {items.map((item, index) => {
          const label = item.label || `Pegadinha ${index + 1}`;
          const detail = item.detail || '';
          const correct = typeof item.correct === 'string' ? item.correct : '';
          const trapGauge = extractGaugeFromText(`${label} ${detail}`);
          const correctGauge = extractGaugeFromText(correct);
          const revealedItem = isRevealed(index);

          const onKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !revealedItem) {
              e.preventDefault();
              reveal(index);
            }
          };

          return (
            <button
              key={index}
              type="button"
              onClick={() => !revealedItem && reveal(index)}
              onKeyDown={onKeyDown}
              className="min-h-[44px] w-full text-left"
            >
              <div
                className={`rounded-2xl border p-4 shadow-sm ${
                  revealedItem
                    ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/70'
                    : 'border-rose-200 bg-gradient-to-br from-white to-rose-50/70'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {revealedItem ? (
                      <Check className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <X className="h-5 w-5 text-rose-600" />
                    )}
                    <GaugeChip gauge={trapGauge} highlight={revealedItem ? 'none' : 'trap'} />
                    {revealedItem && correctGauge ? (
                      <GaugeChip gauge={correctGauge} highlight="correct" />
                    ) : null}
                  </div>
                </div>
                <p className="font-body text-sm font-bold text-slate-900">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{detail}</p>
                {revealedItem ? (
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 border-t border-emerald-200 pt-2 text-sm font-semibold text-emerald-900"
                  >
                    {correct}
                  </motion.p>
                ) : (
                  <span className="mt-2 block font-mono text-[9px] uppercase text-rose-500">
                    Toque → calibre certo
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center text-sm italic ${theme.borderColor} bg-white/80`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
