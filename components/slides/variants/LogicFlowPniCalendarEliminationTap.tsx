'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, Trash2, Trophy, Calendar } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniCatchUpCorpus,
  parsePniCalendarStep,
  pniMonthLabel,
  type ParsedPniCalendarStep,
} from '@/lib/slides/pniSlideUtils';

interface LogicFlowPniCalendarEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function MonthChips({ months }: { months: number[] }) {
  if (months.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {months.map((month) => (
        <span
          key={month}
          className="rounded-full bg-sky-100 px-2.5 py-1 font-mono text-[10px] font-black text-sky-900 ring-1 ring-sky-200/80"
        >
          {pniMonthLabel(month)}
        </span>
      ))}
    </div>
  );
}

function StepBadge({ step }: { step: ParsedPniCalendarStep }) {
  const styles: Record<ParsedPniCalendarStep['kind'], string> = {
    anchor_age: 'bg-sky-100 text-sky-900',
    eliminate: 'bg-rose-100 text-rose-800',
    catchup_eliminate: 'bg-orange-100 text-orange-900',
    locate: 'bg-emerald-100 text-emerald-800',
    fixation: 'bg-lime-100 text-lime-900',
    scenario: 'bg-violet-100 text-violet-900',
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

export function LogicFlowPniCalendarEliminationTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniCalendarEliminationTapProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parsePniCalendarStep(step, index)),
    [normalizedSteps],
  );
  const catchUpMode = useMemo(
    () => isPniCatchUpCorpus(normalizedSteps.join(' ')),
    [normalizedSteps],
  );

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
      if (
        step.letter &&
        (step.kind === 'eliminate' || step.kind === 'catchup_eliminate')
      ) {
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
          <span className="rounded-full border border-lime-200/80 bg-lime-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-lime-900">
            {catchUpMode ? 'Calendário catch-up' : 'Calendário PNI'}
          </span>
          {!catchUpMode ? <Calendar className="h-4 w-4 text-lime-700" aria-hidden /> : null}
        </div>

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
                      : 'bg-white/90 text-lime-900 ring-2 ring-lime-200/60'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={revealedCount}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-white/95 p-4 shadow-md ${
                current.kind === 'locate'
                  ? 'border-emerald-300/80 border-l-[4px] border-l-emerald-500'
                  : current.kind === 'eliminate' || current.kind === 'catchup_eliminate'
                    ? 'border-rose-200/80 border-l-[4px] border-l-rose-400'
                    : 'border-lime-200/80 border-l-[4px] border-l-lime-500'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  {revealedCount}/{parsedSteps.length}
                </span>
                <StepBadge step={current} />
                {current.kind === 'eliminate' || current.kind === 'catchup_eliminate' ? (
                  <Trash2 className="h-4 w-4 text-rose-500" aria-hidden />
                ) : null}
                {current.kind === 'locate' ? (
                  <Trophy className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : null}
              </div>
              {current.months && current.months.length > 0 ? (
                <div className="mb-3">
                  <MonthChips months={current.months} />
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
            className="mx-auto flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-600 px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-lime-300/30 transition hover:scale-[1.02]"
          >
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        {footerRule ? (
          <p className="text-center font-body text-xs text-lime-900/75 md:text-sm">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
