'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Heart, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  parseMulherPrenatalStep,
  prenatalTrimesterLabel,
  type ParsedPrenatalStep,
} from '@/lib/slides/mulherPrenatalSlideUtils';
import { shouldShowLogicFlowTapHint, useLogicFlowReveal } from './logicFlowReveal';

interface LogicFlowMulherPrenatalTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function TrimesterChips({ trimesters }: { trimesters: ParsedPrenatalStep['trimesters'] }) {
  if (trimesters.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {trimesters.map((slot) => (
        <span
          key={slot}
          className="rounded-full bg-pink-100 px-2.5 py-1 font-mono text-[10px] font-black text-pink-900 ring-1 ring-pink-200/80"
        >
          {prenatalTrimesterLabel(slot)}
        </span>
      ))}
    </div>
  );
}

function StepBadge({ step }: { step: ParsedPrenatalStep }) {
  const styles: Record<ParsedPrenatalStep['kind'], string> = {
    anchor_trimester: 'bg-sky-100 text-sky-900',
    judgement: step.judgement === 'false' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800',
    eliminate: 'bg-orange-100 text-orange-900',
    locate: 'bg-pink-100 text-pink-900',
    fixation: 'bg-violet-100 text-violet-900',
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

export function LogicFlowMulherPrenatalTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowMulherPrenatalTapFlowProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parseMulherPrenatalStep(step, index)),
    [normalizedSteps],
  );

  const {
    revealedSteps,
    advanceStep,
    isTapMode,
    isComplete,
    activeStepIndex,
  } = useLogicFlowReveal(parsedSteps.length, 'tap');

  const eliminated = useMemo(() => {
    const out = new Set<string>();
    for (let i = 0; i <= activeStepIndex; i++) {
      const step = parsedSteps[i];
      if (step.letter && step.kind === 'eliminate') out.add(step.letter);
    }
    return out;
  }, [parsedSteps, activeStepIndex]);

  const winnerLetter = useMemo(() => {
    for (let i = parsedSteps.length - 1; i >= 0; i--) {
      const step = parsedSteps[i];
      if (step.kind === 'locate' && step.letter) return step.letter;
    }
    return null;
  }, [parsedSteps]);

  const current = parsedSteps[activeStepIndex];

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
          <Heart className="h-4 w-4 text-pink-400" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-pink-200">
            Trilho gestacional — toque para avançar
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {LETTERS.map((letter) => {
            const isEliminated = eliminated.has(letter);
            const isWinner = isComplete && winnerLetter === letter;
            return (
              <span
                key={letter}
                className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-black transition-all ${
                  isWinner
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300/60'
                    : isEliminated
                      ? 'bg-rose-200/80 text-rose-400 line-through opacity-60'
                      : 'border border-pink-200/80 bg-white/90 text-pink-800'
                }`}
              >
                {letter}
              </span>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepIndex}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto w-full max-w-lg rounded-[1.5rem] border border-pink-200/70 bg-white/95 p-4 shadow-lg"
          >
            <div className="mb-3 flex flex-col items-center gap-2">
              <StepBadge step={current} />
              <TrimesterChips trimesters={current.trimesters} />
            </div>
            <p className="text-center font-body text-sm leading-relaxed text-slate-800 md:text-base">
              {current.text}
            </p>
            {current.judgement ? (
              <div className="mt-3 flex justify-center">
                {current.judgement === 'true' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Check className="h-3.5 w-3.5" /> Verdadeira
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                    <X className="h-3.5 w-3.5" /> Falsa
                  </span>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {!isComplete && isTapMode ? (
          <button
            type="button"
            onClick={advanceStep}
            className="mx-auto flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-pink-600"
          >
            {shouldShowLogicFlowTapHint(isTapMode, isComplete, parsedSteps.length, activeStepIndex)
              ? 'Próximo passo'
              : 'Revelar passo'}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}

        {footerRule ? (
          <p className="text-center font-body text-xs text-pink-900/75 md:text-sm">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
