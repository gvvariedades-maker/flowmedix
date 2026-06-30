'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, X, Check, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractLetterFromText,
  inferExcetoGabaritoLetter,
} from '@/lib/slides/ituCateterSlideUtils';

interface LogicFlowItuExcetoTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

type ParsedStep = {
  raw: string;
  letter: string | null;
  isExceto: boolean;
  isGabarito: boolean;
  isValidCare: boolean;
};

function parseStep(step: string): ParsedStep {
  const letter = extractLetterFromText(step);
  const lower = step.toLowerCase();
  return {
    raw: step,
    letter,
    isExceto: /\bexceto\b|exce[cç][aã]o|falsa|incorreta|n[aã]o condiz/i.test(lower),
    isGabarito: /gabarito|marcar letra|resposta/i.test(lower) && !/eliminar|validar/i.test(lower),
    isValidCare: /conduta correta|cuidado correto|eliminar.*n[aã]o/i.test(lower),
  };
}

export function LogicFlowItuExcetoTap({ steps, theme, footerRule }: LogicFlowItuExcetoTapProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(() => normalized.map(parseStep), [normalized]);
  const prefersReducedMotion = useReducedMotion();
  const winnerLetter = useMemo(() => inferExcetoGabaritoLetter(normalized), [normalized]);

  const [revealedCount, setRevealedCount] = useState(prefersReducedMotion ? parsed.length : 1);

  const advance = useCallback(() => {
    setRevealedCount((c) => Math.min(c + 1, parsed.length));
  }, [parsed.length]);

  const letterState = useMemo(() => {
    const validated = new Set<string>();
    const excetoMarked = new Set<string>();
    for (let i = 0; i < revealedCount; i++) {
      const p = parsed[i];
      if (!p.letter) continue;
      if (p.isValidCare || (/eliminar|validar/i.test(p.raw.toLowerCase()) && !p.isExceto)) {
        validated.add(p.letter);
      }
      if (p.isExceto || p.isGabarito) {
        excetoMarked.add(p.letter);
      }
    }
    return { validated, excetoMarked };
  }, [parsed, revealedCount]);

  const isComplete = revealedCount >= parsed.length;
  const current = parsed[revealedCount - 1];
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-lime-200/80 bg-white/90 px-3 py-2 shadow-sm">
          <Hand className="h-4 w-4 shrink-0 text-lime-700 animate-pulse" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-lime-900 md:text-[11px]">
            Toque em &quot;Próximo passo&quot; para avançar o raciocínio EXCETO
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {letters.map((letter) => {
            const isWinner = isComplete && letter === winnerLetter;
            const isValidated = letterState.validated.has(letter);
            const isExceto = letterState.excetoMarked.has(letter);
            return (
              <div
                key={letter}
                className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-base font-black transition-all md:h-12 md:w-12 ${
                  isWinner
                    ? 'bg-rose-500 text-white ring-4 ring-rose-300/50 scale-110'
                    : isExceto
                      ? 'bg-rose-200/90 text-rose-700 ring-2 ring-rose-300/60'
                      : isValidated
                        ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/50'
                        : 'bg-white/90 text-lime-900 ring-2 ring-lime-200/60'
                }`}
              >
                {isValidated && !isExceto ? (
                  <Check className="h-5 w-5" aria-hidden />
                ) : isExceto ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  letter
                )}
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
                  ? 'border-rose-300/80 border-l-[4px] border-l-rose-500'
                  : current.isValidCare
                    ? 'border-emerald-200/80 border-l-[4px] border-l-emerald-500'
                    : 'border-lime-200/80 border-l-[4px] border-l-lime-500'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-lime-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-lime-800">
                  Passo {revealedCount}/{parsed.length}
                </span>
                {!isComplete && (
                  <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase text-lime-700">
                    <Hand className="h-3.5 w-3.5 animate-pulse" aria-hidden />
                    Toque abaixo
                  </span>
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
            className="mx-auto flex min-h-[48px] animate-pulse items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-lime-950 shadow-lg shadow-lime-400/40 ring-2 ring-lime-300 ring-offset-2 transition hover:animate-none hover:bg-lime-400 hover:scale-[1.02]"
          >
            <Hand className="h-4 w-4" aria-hidden />
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}

        {footerRule && (
          <p className="mt-auto text-center font-mono text-[10px] font-bold uppercase tracking-widest text-lime-800/70">
            {footerRule}
          </p>
        )}
      </div>
    </div>
  );
}
