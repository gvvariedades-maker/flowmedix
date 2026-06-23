'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Hand, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseAdolescentVfWeaveStep } from '@/lib/slides/adolescentSlideUtils';
import { LogicFlowFooter } from './LogicFlowFooter';
import {
  useLogicFlowReveal,
  shouldShowLogicFlowTapHint,
} from './logicFlowReveal';

interface LogicFlowAdolescentVfWeaveTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

const THREADS = ['I', 'II', 'III'] as const;

function ThreadColumn({
  roman,
  judgement,
  active,
}: {
  roman: (typeof THREADS)[number];
  judgement?: 'true' | 'false';
  active: boolean;
}) {
  const hasJudgement = judgement === 'true' || judgement === 'false';
  const isTrue = judgement === 'true';

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-black transition-all ${
          active
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-300/40 ring-2 ring-sky-300/50'
            : 'border border-sky-200/80 bg-white text-sky-700'
        }`}
      >
        {roman}
      </div>
      <div className="relative flex w-2 flex-1 min-h-[72px] flex-col items-center overflow-hidden rounded-full bg-sky-100/80">
        <motion.div
          className={`w-full rounded-full ${
            !hasJudgement
              ? 'bg-sky-200/60 h-full'
              : isTrue
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-b from-rose-300 to-rose-500'
          }`}
          initial={{ height: 0 }}
          animate={{ height: hasJudgement ? '100%' : '20%' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
      {hasJudgement ? (
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            isTrue ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {isTrue ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
        </span>
      ) : (
        <span className="h-7 w-7 rounded-full border border-dashed border-sky-300/80" aria-hidden />
      )}
    </div>
  );
}

export function LogicFlowAdolescentVfWeaveTap({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentVfWeaveTapProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parseAdolescentVfWeaveStep(step, index)),
    [normalizedSteps],
  );

  const {
    revealedSteps,
    advanceStep,
    isTapMode,
    isComplete,
    currentPasso,
    activeStepIndex,
  } = useLogicFlowReveal(parsedSteps.length, 'tap');

  const [showLetter, setShowLetter] = useState(false);

  const threadJudgements = useMemo(() => {
    const map: Partial<Record<(typeof THREADS)[number], 'true' | 'false'>> = {};
    for (let i = 0; i <= activeStepIndex; i++) {
      const parsed = parsedSteps[i];
      if (parsed?.kind === 'judgement' && parsed.roman && parsed.judgement) {
        map[parsed.roman] = parsed.judgement;
      }
    }
    return map;
  }, [activeStepIndex, parsedSteps]);

  const answerLetter = useMemo(() => {
    for (const parsed of parsedSteps) {
      if (parsed.kind === 'combine' && parsed.letter) return parsed.letter;
    }
    const last = parsedSteps[parsedSteps.length - 1];
    const m = last?.text.match(/\b([A-E])\b/);
    return m?.[1];
  }, [parsedSteps]);

  const activeParsed = parsedSteps[activeStepIndex];
  const showTapHint = shouldShowLogicFlowTapHint(
    isTapMode,
    isComplete,
    parsedSteps.length,
    activeStepIndex,
  );

  const handleAdvance = useCallback(() => {
    if (isComplete) return;
    const nextIndex = activeStepIndex + 1;
    const nextParsed = parsedSteps[nextIndex];
    if (nextParsed?.kind === 'combine') setShowLetter(true);
    advanceStep();
  }, [activeStepIndex, advanceStep, isComplete, parsedSteps]);

  if (parsedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div
          role="status"
          className="mb-3 flex flex-col items-center gap-1 rounded-xl border border-sky-200/80 bg-sky-50/90 px-4 py-2.5 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-sky-900">
            <Hand className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Toque em <span className="font-bold">Próximo</span> no rodapé
          </p>
          <p className="font-body text-xs text-sky-800/85">
            Cada toque preenche um fio (I, II ou III) até montar a letra.
          </p>
        </div>

        <div className="mb-4 flex items-end justify-center gap-3 px-2">
          {THREADS.map((roman) => (
            <ThreadColumn
              key={roman}
              roman={roman}
              judgement={threadJudgements[roman]}
              active={activeParsed?.roman === roman}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepIndex}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            className="flex flex-1 flex-col rounded-2xl border border-sky-200/80 bg-white/95 p-5 shadow-lg shadow-sky-100/40"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700">
              {activeParsed?.title ?? `Passo ${activeStepIndex + 1}`}
            </p>
            <p className="mt-3 flex-1 font-body text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
              {activeParsed?.text}
            </p>

            {showLetter && answerLetter && activeParsed?.kind === 'combine' ? (
              <motion.div
                initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-sky-50 py-4"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                  Fios verdadeiros →
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 font-display text-2xl font-black text-white shadow-lg shadow-sky-300/40">
                  {answerLetter}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <LogicFlowFooter
          isTapMode={isTapMode}
          isComplete={isComplete}
          currentPasso={currentPasso}
          total={parsedSteps.length}
          revealedCount={revealedSteps.length}
          onAdvance={handleAdvance}
          showTapHint={showTapHint}
        />

        {footerRule && isComplete ? (
          <p className="mt-3 rounded-xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-center font-body text-sm italic text-sky-900/80">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
