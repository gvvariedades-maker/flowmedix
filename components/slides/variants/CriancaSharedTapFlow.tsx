'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Hand, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseCriancaTapStep, CRIANCA_LETTERS, type ParsedCriancaStep } from '@/lib/slides/criancaSlideUtils';
import { shouldShowLogicFlowTapHint, useLogicFlowReveal } from './logicFlowReveal';

interface CriancaTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

function StepBadge({ step }: { step: ParsedCriancaStep }) {
  const styles: Record<ParsedCriancaStep['kind'], string> = {
    anchor: 'bg-cyan-100 text-cyan-900',
    judgement: step.judgement === 'false' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800',
    eliminate: 'bg-orange-100 text-orange-900',
    locate: 'bg-teal-100 text-teal-900',
    fixation: 'bg-violet-100 text-violet-900',
    step: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${styles[step.kind]}`}>
      {step.title}
    </span>
  );
}

function RomanThreads({ steps, activeIndex }: { steps: ParsedCriancaStep[]; activeIndex: number }) {
  const threads = ['I', 'II', 'III'] as const;
  const judgements = useMemo(() => {
    const out: Record<string, 'true' | 'false' | undefined> = {};
    for (let i = 0; i <= activeIndex; i++) {
      const s = steps[i];
      if (s.roman && s.judgement) out[s.roman] = s.judgement;
    }
    return out;
  }, [steps, activeIndex]);

  return (
    <div className="mb-4 flex justify-center gap-3">
      {threads.map((roman) => {
        const j = judgements[roman];
        const active = roman in judgements;
        return (
          <div key={roman} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-black ${
                active ? 'bg-cyan-500 text-white ring-2 ring-cyan-300/50' : 'border border-cyan-200 bg-white text-cyan-800'
              }`}
            >
              {roman}
            </div>
            {j === 'true' ? <Check className="h-4 w-4 text-emerald-600" /> : null}
            {j === 'false' ? <X className="h-4 w-4 text-rose-600" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export function CriancaTapFlow({ steps, theme, footerRule }: CriancaTapFlowProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parseCriancaTapStep(step, index)),
    [normalizedSteps],
  );

  const { revealedSteps, advanceStep, isTapMode, isComplete, activeStepIndex } = useLogicFlowReveal(
    parsedSteps.length,
    'tap',
  );

  const eliminated = useMemo(() => {
    const out = new Set<string>();
    for (let i = 0; i <= activeStepIndex; i++) {
      const step = parsedSteps[i];
      if (step.letter && step.kind === 'eliminate') out.add(step.letter);
    }
    return out;
  }, [parsedSteps, activeStepIndex]);

  const hasVf = parsedSteps.some((s) => s.roman);

  if (parsedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const current = parsedSteps[activeStepIndex];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        {hasVf ? <RomanThreads steps={parsedSteps} activeIndex={activeStepIndex} /> : null}

        <div className="flex flex-wrap justify-center gap-2">
          {CRIANCA_LETTERS.map((letter) => (
            <span
              key={letter}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm font-black transition-all ${
                eliminated.has(letter)
                  ? 'bg-slate-100 text-slate-300 line-through'
                  : 'bg-cyan-100 text-cyan-900 ring-1 ring-cyan-200'
              }`}
            >
              {letter}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {revealedSteps.map((stepIndex) => {
            const step = parsedSteps[stepIndex];
            const isActive = stepIndex === activeStepIndex;
            return (
              <motion.div
                key={stepIndex}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: isActive ? 1 : 0.55, y: 0 }}
                className={`rounded-2xl border p-4 shadow-sm ${
                  isActive ? 'border-cyan-300 bg-white ring-2 ring-cyan-200/50' : 'border-slate-200/70 bg-white/80'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <StepBadge step={step} />
                  {step.marker ? (
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-900">
                      {step.marker}
                    </span>
                  ) : null}
                </div>
                <p className={`font-body text-sm leading-relaxed ${theme.textPrimary}`}>{step.text}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTapMode && !isComplete && shouldShowLogicFlowTapHint(isTapMode, isComplete, parsedSteps.length, activeStepIndex) ? (
          <button
            type="button"
            onClick={advanceStep}
            className="mx-auto flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 font-body text-sm font-bold text-white shadow-lg shadow-cyan-300/40 transition hover:bg-cyan-600"
          >
            <Hand className="h-4 w-4" aria-hidden />
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        {footerRule ? (
          <p className="text-center font-body text-xs text-cyan-900/75 md:text-sm">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
