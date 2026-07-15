'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractRomanFromText,
  inferTbVfItemStatus,
  type TbVfItemStatus,
} from '@/lib/slides/tuberculoseSlideUtils';

interface LogicFlowTbVfEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

type ParsedStep = {
  raw: string;
  roman: 'I' | 'II' | 'III' | null;
  status: TbVfItemStatus;
  isGabarito: boolean;
};

function parseStep(step: string): ParsedStep {
  const roman = extractRomanFromText(step);
  const status = inferTbVfItemStatus(step);
  const lower = step.toLowerCase();
  return {
    raw: step,
    roman,
    status,
    isGabarito: /letra\s*[a-e]|gabarito|marcar/i.test(lower) && status === 'neutra',
  };
}

const ROMAN_STATUS: Record<TbVfItemStatus, { bg: string; text: string }> = {
  verdadeira: { bg: 'bg-emerald-500 text-white', text: 'text-emerald-700' },
  falsa: { bg: 'bg-rose-400 text-white line-through opacity-80', text: 'text-rose-600' },
  neutra: { bg: 'bg-white/90 text-orange-900 ring-2 ring-orange-200/60', text: 'text-slate-700' },
};

export function LogicFlowTbVfEliminationTap({ steps, theme, footerRule }: LogicFlowTbVfEliminationTapProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(() => normalized.map(parseStep), [normalized]);
  const prefersReducedMotion = useReducedMotion();

  const [revealedCount, setRevealedCount] = useState(prefersReducedMotion ? parsed.length : 1);

  const advance = useCallback(() => {
    setRevealedCount((c) => Math.min(c + 1, parsed.length));
  }, [parsed.length]);

  const itemStatus = useMemo(() => {
    const out: Record<'I' | 'II' | 'III', TbVfItemStatus> = {
      I: 'neutra',
      II: 'neutra',
      III: 'neutra',
    };
    for (let i = 0; i < revealedCount; i++) {
      const p = parsed[i];
      if (p.roman && p.status !== 'neutra') out[p.roman] = p.status;
    }
    return out;
  }, [parsed, revealedCount]);

  const isComplete = revealedCount >= parsed.length;
  const current = parsed[revealedCount - 1];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex justify-center gap-3">
          {(['I', 'II', 'III'] as const).map((roman) => {
            const st = itemStatus[roman];
            const style = ROMAN_STATUS[st];
            return (
              <div
                key={roman}
                className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-black transition-all md:h-14 md:w-14 ${style.bg}`}
              >
                {roman}
                {st === 'verdadeira' && <Check className="ml-0.5 h-4 w-4" aria-hidden />}
                {st === 'falsa' && <X className="ml-0.5 h-4 w-4" aria-hidden />}
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
                current.status === 'falsa'
                  ? 'border-rose-200/80 border-l-[4px] border-l-rose-400'
                  : current.status === 'verdadeira'
                    ? 'border-emerald-200/80 border-l-[4px] border-l-emerald-500'
                    : current.isGabarito
                      ? 'border-orange-300/80 border-l-[4px] border-l-orange-600'
                      : 'border-orange-200/80 border-l-[4px] border-l-orange-500'
              }`}
            >
              <span className="mb-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-orange-800">
                Passo {revealedCount}/{parsed.length}
              </span>
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
