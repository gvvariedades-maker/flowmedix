'use client';

import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  useLogicFlowReveal,
  isStepRevealed,
  isStepFuture,
  isStepActive,
  shouldShowLogicFlowTapHint,
  type LogicFlowRevealMode,
} from './logicFlowReveal';
import { LogicFlowFooter } from './LogicFlowFooter';

interface LogicFlowStepLadderProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
}

function stepTitle(step: string, index: number): string {
  const lower = step.toLowerCase();
  if (index === 0 || /ler o comando|ler a afirmativa|ler o enunciado/i.test(lower)) {
    return 'Ler o comando da questão';
  }
  if (/gabarito|identificar gabarito|marcar letra/i.test(lower)) {
    return 'Identificar o gabarito';
  }
  if (/testar letra|eliminar/i.test(lower)) {
    const m = step.match(/letra\s*([A-E])/i);
    return m ? `Testar letra ${m[1].toUpperCase()}` : 'Eliminar distrator';
  }
  if (/fixação|fixar/i.test(lower)) {
    return 'Fixação do tema';
  }
  return `Passo ${index + 1}`;
}

export function LogicFlowStepLadder({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowStepLadderProps) {
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const {
    revealedSteps,
    advanceStep,
    isTapMode,
    isComplete,
    currentPasso,
    activeStepIndex,
  } = useLogicFlowReveal(normalizedSteps.length, revealMode);

  const showTapHint = shouldShowLogicFlowTapHint(
    isTapMode,
    isComplete,
    normalizedSteps.length,
    activeStepIndex,
  );

  const handleAdvance = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const getStepState = (index: number) => {
    const revealed = isStepRevealed(index, revealedSteps);
    const future = isStepFuture(index, revealedSteps);
    const active = isStepActive(index, revealedSteps, isTapMode);
    const completed = revealed && !active;
    return { revealed, future, active, completed };
  };

  const handleStepActivate = (index: number) => {
    if (!isTapMode || isComplete) return;
    const { active } = getStepState(index);
    if (active) handleAdvance();
  };

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto w-full max-w-lg space-y-0">
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active, completed } = getStepState(index);
            const isLast = index === normalizedSteps.length - 1;
            const canTap = isTapMode && active && !isComplete;
            const open = active || (completed && index === activeStepIndex - 1);

            return (
              <div key={index} className="relative flex gap-3 pb-4">
                {!isLast ? (
                  <div
                    className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-blue-300/50 to-transparent"
                    aria-hidden
                  />
                ) : null}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold shadow-md ${
                    completed
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-300/50'
                      : active
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-300/50 ring-4 ring-blue-200/60'
                        : 'border-2 border-blue-200/90 bg-gradient-to-br from-blue-50 to-white text-blue-400 shadow-sm'
                  }`}
                >
                  {completed ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <button
                    type="button"
                    disabled={future && isTapMode}
                    onClick={() => handleStepActivate(index)}
                    className={`w-full rounded-xl border text-left transition-all ${
                      active
                        ? 'border-blue-300/80 border-l-[5px] border-l-blue-500 bg-gradient-to-br from-blue-50 via-white to-sky-50/90 shadow-lg shadow-blue-200/40 ring-1 ring-blue-200/50'
                        : completed
                          ? 'border-emerald-300/70 border-l-[5px] border-l-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 shadow-md shadow-emerald-200/30 ring-1 ring-emerald-200/40'
                          : future
                            ? 'border-slate-200/80 bg-gradient-to-br from-slate-50 to-white opacity-60 shadow-sm'
                            : 'border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 shadow-sm ring-1 ring-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 p-3.5">
                      <div className="min-w-0">
                        <p
                          className={`font-mono text-[9px] font-bold uppercase tracking-wider ${
                            active ? 'text-blue-700' : completed ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          Passo {index + 1}
                        </p>
                        <p
                          className={`font-body text-sm font-bold ${
                            future && isTapMode ? 'text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {stepTitle(step, index)}
                        </p>
                      </div>
                      {canTap ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white shadow-sm shadow-emerald-300/40">
                          <Hand className="h-3 w-3" aria-hidden />
                          Toque
                        </span>
                      ) : null}
                    </div>

                    {(open || (!isTapMode && revealed)) && !future ? (
                      <div className="border-t border-inherit bg-white/40 px-3.5 pb-3.5 pt-2">
                        <p className="font-body text-xs leading-relaxed text-slate-700 md:text-sm">
                          {isTapMode && future ? '••••••••' : step}
                        </p>
                      </div>
                    ) : null}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LogicFlowFooter
        isTapMode={isTapMode}
        isComplete={isComplete}
        currentPasso={currentPasso}
        total={normalizedSteps.length}
        revealedCount={revealedSteps.length}
        onAdvance={handleAdvance}
        showTapHint={showTapHint}
      />
    </div>
  );
}
