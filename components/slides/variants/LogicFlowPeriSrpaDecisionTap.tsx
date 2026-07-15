'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  parsePeriSrpaStep,
  periSrpaSlotLabel,
  type ParsedPeriStep,
} from '@/lib/slides/perioperatoriaSlideUtils';
import { shouldShowLogicFlowTapHint, useLogicFlowReveal } from './logicFlowReveal';

interface LogicFlowPeriSrpaDecisionTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: 'auto' | 'tap';
  footerRule?: string;
}

function StepBadge({ step }: { step: ParsedPeriStep }) {
  const styles: Record<ParsedPeriStep['kind'], string> = {
    anchor: 'bg-violet-100 text-violet-900',
    eliminate: 'bg-orange-100 text-orange-900',
    locate: 'bg-fuchsia-100 text-fuchsia-900',
    fixation: 'bg-emerald-100 text-emerald-800',
    step: 'bg-slate-100 text-slate-700',
  };
  const labels: Record<ParsedPeriStep['kind'], string> = {
    anchor: 'Enquadramento',
    eliminate: 'Eliminar',
    locate: 'Localizar',
    fixation: 'Fixação',
    step: 'Passo',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${styles[step.kind]}`}
    >
      {labels[step.kind]}
    </span>
  );
}

function SrpaSlotChips({ slots }: { slots: ParsedPeriStep['srpaSlots'] }) {
  if (slots.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {slots.map((slot) => (
        <span
          key={slot}
          className="rounded-full bg-fuchsia-100 px-2.5 py-1 font-mono text-[10px] font-black text-fuchsia-900 ring-1 ring-fuchsia-200/80"
        >
          {periSrpaSlotLabel(slot)}
        </span>
      ))}
    </div>
  );
}

export function LogicFlowPeriSrpaDecisionTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowPeriSrpaDecisionTapProps) {
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalizedSteps.map((text) => parsePeriSrpaStep(text)),
    [normalizedSteps],
  );

  const { revealedSteps, advanceStep, isTapMode, isComplete, activeStepIndex } = useLogicFlowReveal(
    parsed.length,
    revealMode,
  );

  if (parsed.length === 0) return null;

  const showTapHint = shouldShowLogicFlowTapHint(isTapMode, isComplete, parsed.length, activeStepIndex);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 flex flex-col gap-3">
        {parsed.map((step, index) => {
          const revealed = revealedSteps.includes(index);
          const active = isTapMode && index === activeStepIndex && !isComplete;
          const future = isTapMode && !revealed && index > activeStepIndex;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: future ? 0.35 : revealed ? 1 : 0.5, y: 0 }}
              transition={{ delay: isTapMode ? 0 : index * 0.08 }}
              role={active ? 'button' : undefined}
              tabIndex={active ? 0 : undefined}
              onClick={active ? advanceStep : undefined}
              onKeyDown={(e) => {
                if (active && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  advanceStep();
                }
              }}
              className={`overflow-hidden rounded-[1.25rem] border border-fuchsia-200/80 bg-white/95 p-4 shadow-sm ${
                active ? 'cursor-pointer ring-2 ring-fuchsia-300/50' : ''
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <StepBadge step={step} />
                {revealed ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-slate-400">{index + 1}</span>
                )}
              </div>
              {revealed ? (
                <>
                  <SrpaSlotChips slots={step.srpaSlots} />
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{step.text}</p>
                </>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {showTapHint ? (
        <button
          type="button"
          onClick={advanceStep}
          className="relative z-10 mx-auto mt-4 flex items-center gap-2 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-md"
        >
          Revelar próximo passo
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}

      {footerRule ? (
        <p className="relative z-10 mt-3 text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
      ) : null}
    </div>
  );
}
