'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, Trash2, Trophy } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { extractLetterFromText } from '@/lib/slides/etiologySlideUtils';

interface LogicFlowEtiologyEliminationTapProps {
  steps: string[];
  theme: ThemeColors;
  footerRule?: string;
}

type ParsedStep = {
  raw: string;
  letter: string | null;
  isElimination: boolean;
  isGabarito: boolean;
};

function parseStep(step: string): ParsedStep {
  const letter = extractLetterFromText(step);
  const lower = step.toLowerCase();
  return {
    raw: step,
    letter,
    isElimination: /descarta|elimina|sobra/i.test(lower),
    isGabarito: /marcar|gabarito|letra\s*a\b/i.test(lower) && !/descarta/i.test(lower),
  };
}

export function LogicFlowEtiologyEliminationTap({
  steps,
  theme,
  footerRule,
}: LogicFlowEtiologyEliminationTapProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(() => normalized.map(parseStep), [normalized]);
  const prefersReducedMotion = useReducedMotion();

  const [revealedCount, setRevealedCount] = useState(prefersReducedMotion ? parsed.length : 1);

  const advance = useCallback(() => {
    setRevealedCount((c) => Math.min(c + 1, parsed.length));
  }, [parsed.length]);

  const eliminated = useMemo(() => {
    const out = new Set<string>();
    for (let i = 0; i < revealedCount; i++) {
      const p = parsed[i];
      if (p.letter && p.isElimination) out.add(p.letter);
    }
    return out;
  }, [parsed, revealedCount]);

  const isComplete = revealedCount >= parsed.length;
  const current = parsed[revealedCount - 1];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        {/* Painel de letras — eliminação visual */}
        <div className="flex justify-center gap-2 md:gap-3">
          {['A', 'B', 'C', 'D'].map((letter) => {
            const isOut = eliminated.has(letter);
            const isWinner = isComplete && letter === 'A';
            return (
              <div
                key={letter}
                className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-black transition-all duration-300 md:h-14 md:w-14 md:text-xl ${
                  isWinner
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-300/50 scale-110'
                    : isOut
                      ? 'bg-rose-200/90 text-rose-400 line-through opacity-60'
                      : 'bg-white/90 text-orange-900 ring-2 ring-orange-200/60'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={revealedCount}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-white/95 p-4 shadow-md ${
                current.isGabarito
                  ? 'border-emerald-300/80 border-l-[4px] border-l-emerald-500'
                  : current.isElimination
                    ? 'border-rose-200/80 border-l-[4px] border-l-rose-400'
                    : 'border-orange-200/80 border-l-[4px] border-l-orange-500'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-orange-800">
                  Passo {revealedCount}/{parsed.length}
                </span>
                {current.isElimination && (
                  <Trash2 className="h-4 w-4 text-rose-500" aria-hidden />
                )}
                {current.isGabarito && (
                  <Trophy className="h-4 w-4 text-emerald-600" aria-hidden />
                )}
              </div>
              <p className="font-body text-sm leading-relaxed text-slate-800 md:text-base">{current.raw}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isComplete && (
          <button
            type="button"
            onClick={advance}
            className="mx-auto flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-orange-300/30 transition hover:scale-[1.02]"
          >
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}

        {footerRule && (
          <p className="text-center font-body text-xs text-orange-900/70">{footerRule}</p>
        )}
      </div>
    </div>
  );
}
