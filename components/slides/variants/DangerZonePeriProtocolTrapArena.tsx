'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, CheckSquare, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferPeriProtocolSlot,
  periProtocolSlotLabel,
  PERI_PROTOCOL_WHO,
  type PeriProtocolSlot,
} from '@/lib/slides/perioperatoriaSlideUtils';

const PROTOCOL_RAIL: PeriProtocolSlot[] = [...PERI_PROTOCOL_WHO, 'cdc', 'assepsia'];

function inferPeriProtocolTrapLanes(
  label: string,
  detail: string,
  correct: string,
): { trapSlots: PeriProtocolSlot[]; correctSlots: PeriProtocolSlot[]; hasRail: boolean } {
  const trapSlot = inferPeriProtocolSlot(label, detail);
  const correctSlot = inferPeriProtocolSlot(label, correct);
  const trapSlots = trapSlot !== 'geral' ? [trapSlot] : [];
  const correctSlots = correctSlot !== 'geral' ? [correctSlot] : [];
  return {
    trapSlots,
    correctSlots,
    hasRail: trapSlots.length > 0 || correctSlots.length > 0,
  };
}

function ProtocolSlotRail({
  trapSlots,
  correctSlots,
  revealed,
}: {
  trapSlots: PeriProtocolSlot[];
  correctSlots: PeriProtocolSlot[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200/80 bg-violet-50/50 px-2 py-2"
      aria-hidden
    >
      {PROTOCOL_RAIL.map((slot) => {
        const isTrap = trapSlots.includes(slot);
        const isCorrect = correctSlots.includes(slot);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={slot}
            className={`rounded-lg px-2 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`font-mono text-[8px] font-black uppercase tracking-wide ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {periProtocolSlotLabel(slot)}
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

interface DangerZonePeriProtocolTrapArenaProps {
  content: string;
  items?: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

export function DangerZonePeriProtocolTrapArena({
  content,
  items = [],
  theme,
  footerRule,
  compareRevealMode,
}: DangerZonePeriProtocolTrapArenaProps) {
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

  if (items.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3">
        <p className="text-center text-sm font-bold text-violet-950">{content}</p>

        {items.map((item, index) => {
          const label = item.label || item.title || `Pegadinha ${index + 1}`;
          const letter = extractLetterFromLabel(label);
          const trapText = item.detail || item.description || '';
          const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
          const { trapSlots, correctSlots, hasRail } = inferPeriProtocolTrapLanes(
            label,
            trapText,
            correctText,
          );
          const isRevealed = isItemRevealed(index);

          return (
            <motion.button
              key={index}
              type="button"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
              onClick={() => handleReveal(index)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleReveal(index);
                }
              }}
              aria-expanded={isRevealed}
              className={`w-full overflow-hidden rounded-[1.25rem] border text-left transition-all ${
                isRevealed
                  ? 'border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/40 to-white shadow-md'
                  : 'border-rose-200/80 bg-white/95 shadow-sm hover:border-rose-300'
              }`}
            >
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  {letter ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 font-display text-lg font-black text-white">
                      {letter}
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-rose-700">
                      Pegadinha protocolo
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
                    <p className="mt-1 text-sm text-slate-600">{trapText}</p>
                  </div>
                  {isRevealed ? (
                    <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <X className="h-5 w-5 shrink-0 text-rose-500" />
                  )}
                </div>

                {hasRail ? (
                  <ProtocolSlotRail
                    trapSlots={trapSlots}
                    correctSlots={correctSlots}
                    revealed={isRevealed}
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-violet-200/70 bg-violet-50/60 px-3 py-2">
                    <CheckSquare className="h-4 w-4 shrink-0 text-violet-700" aria-hidden />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-violet-800">
                      WHO · CDC
                    </span>
                  </div>
                )}

                {isRevealed && correctText ? (
                  <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3 text-sm leading-relaxed text-emerald-900">
                    {correctText}
                  </p>
                ) : null}
              </div>
            </motion.button>
          );
        })}

        {footerRule ? (
          <p className="text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
