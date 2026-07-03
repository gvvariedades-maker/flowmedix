'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, Snowflake, Thermometer, Trash2, Trophy } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniVfColdChainCorpus,
  parsePniColdChainStep,
  pniTempLabel,
  type ParsedPniColdChainStep,
} from '@/lib/slides/pniSlideUtils';

interface LogicFlowPniColdChainTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function TempChips({ markers }: { markers: number[] }) {
  if (markers.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {markers.map((marker) => (
        <span
          key={marker}
          className="rounded-full bg-teal-100 px-2.5 py-1 font-mono text-[10px] font-black text-teal-900 ring-1 ring-teal-200/80"
        >
          {pniTempLabel(marker)}°C
        </span>
      ))}
    </div>
  );
}

function StepBadge({ step }: { step: ParsedPniColdChainStep }) {
  const styles: Record<ParsedPniColdChainStep['kind'], string> = {
    vf_judge: 'bg-violet-100 text-violet-900',
    vf_combine: 'bg-sky-100 text-sky-900',
    temp_anchor: 'bg-teal-100 text-teal-900',
    eliminate: 'bg-rose-100 text-rose-800',
    locate: 'bg-emerald-100 text-emerald-800',
    exceto: 'bg-orange-100 text-orange-900',
    fixation: 'bg-lime-100 text-lime-900',
    step: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${styles[step.kind]}`}
    >
      {step.title}
    </span>
  );
}

export function LogicFlowPniColdChainTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniColdChainTapProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parsePniColdChainStep(step, index)),
    [normalizedSteps],
  );
  const vfMode = useMemo(() => isPniVfColdChainCorpus(normalizedSteps.join(' ')), [normalizedSteps]);

  const [revealedCount, setRevealedCount] = useState(
    reduceMotion ? parsedSteps.length : 1,
  );

  const advance = useCallback(() => {
    setRevealedCount((c) => Math.min(c + 1, parsedSteps.length));
  }, [parsedSteps.length]);

  const eliminated = useMemo(() => {
    const out = new Set<string>();
    for (let i = 0; i < revealedCount; i++) {
      const step = parsedSteps[i];
      if (step.letter && step.kind === 'eliminate') {
        out.add(step.letter);
      }
    }
    return out;
  }, [parsedSteps, revealedCount]);

  const winnerLetter = useMemo(() => {
    for (let i = parsedSteps.length - 1; i >= 0; i--) {
      const step = parsedSteps[i];
      if (step.kind === 'locate' && step.letter) return step.letter;
    }
    return null;
  }, [parsedSteps]);

  const isComplete = revealedCount >= parsedSteps.length;
  const current = parsedSteps[revealedCount - 1];

  if (parsedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-teal-900">
            {vfMode ? 'Cadeia de frio — V/F' : 'Rede de frio PNI'}
          </span>
          {vfMode ? (
            <Thermometer className="h-4 w-4 text-teal-700" aria-hidden />
          ) : (
            <Snowflake className="h-4 w-4 text-teal-700" aria-hidden />
          )}
        </div>

        {!vfMode ? (
          <div className="flex flex-wrap justify-center gap-2">
            {LETTERS.map((letter) => {
              const isOut = eliminated.has(letter);
              const isWinner = isComplete && winnerLetter === letter;
              return (
                <div
                  key={letter}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-base font-black transition-all duration-300 md:h-12 md:w-12 md:text-lg ${
                    isWinner
                      ? 'scale-110 bg-emerald-500 text-white ring-4 ring-emerald-300/50'
                      : isOut
                        ? 'bg-rose-200/90 text-rose-400 line-through opacity-60'
                        : 'bg-white/90 text-teal-900 ring-2 ring-teal-200/60'
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={revealedCount}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-white/95 p-4 shadow-md ${
                current.kind === 'locate'
                  ? 'border-emerald-300/80 border-l-[4px] border-l-emerald-500'
                  : current.kind === 'eliminate'
                    ? 'border-rose-200/80 border-l-[4px] border-l-rose-400'
                    : current.kind === 'vf_judge'
                      ? 'border-violet-200/80 border-l-[4px] border-l-violet-400'
                      : 'border-teal-200/80 border-l-[4px] border-l-teal-500'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  {revealedCount}/{parsedSteps.length}
                </span>
                <StepBadge step={current} />
                {current.kind === 'eliminate' ? (
                  <Trash2 className="h-4 w-4 text-rose-500" aria-hidden />
                ) : null}
                {current.kind === 'locate' ? (
                  <Trophy className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : null}
              </div>
              {current.markers && current.markers.length > 0 ? (
                <div className="mb-3">
                  <TempChips markers={current.markers} />
                </div>
              ) : null}
              <p className="font-body text-sm leading-relaxed text-slate-800 md:text-base">{current.text}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!isComplete ? (
          <button
            type="button"
            onClick={advance}
            className="mx-auto flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-teal-300/30 transition hover:scale-[1.02]"
          >
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        {footerRule ? (
          <p className="text-center font-body text-xs text-teal-900/75 md:text-sm">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
