'use client';

import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Hand, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  extractLetterFromTrapLabel,
  inferZTrapBands,
  Z_RAIL_MARKERS,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';

interface DangerZoneAdolescentZThresholdTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

function ZMiniRail({
  trapPosition,
  correctPosition,
  revealed,
}: {
  trapPosition: number;
  correctPosition: number;
  revealed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-0.5 rounded-lg border border-sky-200/80 bg-sky-50/50 px-2 py-2">
      {Z_RAIL_MARKERS.map((marker) => {
        const isTrap = Math.abs(trapPosition - marker) < 0.75;
        const isCorrect = Math.abs(correctPosition - marker) < 0.75;
        return (
          <div
            key={marker}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-md px-0.5 py-1 transition-all ${
              isTrap && !revealed
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : isCorrect && revealed
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/50 opacity-70'
            }`}
          >
            <span className="font-mono text-[8px] font-black tabular-nums text-slate-700">
              {marker > 0 ? `+${marker}` : marker}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DangerZoneAdolescentZThresholdTrap({
  content,
  items,
  theme,
  revealMode = 'tap',
  footerRule,
}: DangerZoneAdolescentZThresholdTrapProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    revealMode,
  );

  const handleReveal = useCallback(
    (index: number) => {
      if (isTapMode) revealItem(index);
    },
    [isTapMode, revealItem],
  );

  const openedCount = items.filter((_, i) => isItemRevealed(i)).length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
        <h2 className="text-center font-display text-base font-black uppercase tracking-wide text-rose-800 md:text-lg">
          {content}
        </h2>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-700/80">
            {openedCount}/{items.length} pegadinhas reveladas
          </p>
          <p className="flex items-center justify-center gap-1.5 font-body text-xs font-semibold text-rose-900">
            <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Toque em cada card para ver a faixa certa no trilho Z
          </p>
        </div>

        {items.map((item, index) => {
          const isOpen = isItemRevealed(index);
          const letter = extractLetterFromTrapLabel(item.label);
          const bands = inferZTrapBands(item.detail ?? '', item.correct ?? '');

          return (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.05 }}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm"
            >
              <button
                type="button"
                onClick={() => !isOpen && handleReveal(index)}
                className="flex min-h-[44px] w-full items-start gap-3 p-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <X className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {letter ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-black text-slate-800">
                        {letter}
                      </span>
                    ) : null}
                    <p className="font-display text-sm font-bold text-slate-900">{item.label}</p>
                  </div>
                  <p className="mt-1 font-body text-xs text-slate-600">{item.detail}</p>
                  {!isOpen ? (
                    <p className="mt-2 flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-600">
                      <Hand className="h-3 w-3 shrink-0" aria-hidden />
                      Toque para ver a correção
                    </p>
                  ) : null}
                </div>
              </button>

              <div className="border-t border-slate-100 px-3 pb-3">
                <ZMiniRail
                  trapPosition={bands.trapPosition}
                  correctPosition={bands.correctPosition}
                  revealed={isOpen}
                />
                <p className="mt-2 font-mono text-[10px] text-slate-500">
                  {isOpen ? 'Faixa correta no verde' : bands.trapLabel}
                </p>
              </div>

              {isOpen && item.correct ? (
                <div className="border-t border-emerald-200/80 bg-emerald-50/80 px-3 py-3">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <p className="font-body text-sm leading-relaxed text-emerald-950">{item.correct}</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          );
        })}

        {footerRule ? (
          <p className="text-center font-body text-xs font-semibold text-sky-900">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
