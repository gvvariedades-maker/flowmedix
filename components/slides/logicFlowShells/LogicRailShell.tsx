'use client';

import { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';
import {
  useLogicFlowReveal,
  type LogicFlowRevealMode,
} from '../variants/logicFlowReveal';
import { ProtocolRailRow } from '../primitives';
import {
  FOCUS_ACCENTS,
  focusStepTitle,
  type LogicFlowShellAccent,
} from './focusAccents';

export interface LogicRailShellProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  accent?: LogicFlowShellAccent;
  /** Sempre budget ≤3 (protocolo). Default true. */
  applyTapBudget?: boolean;
  eyebrow?: string;
}

function badgeForStep(step: string, index: number): string {
  const letter = step.match(/\b([A-E])\b/)?.[1];
  if (letter && /eliminar|validar|letra/i.test(step)) return letter.toUpperCase();
  const xabcde = step.match(/\b([XABCDE])\b/i)?.[1];
  if (xabcde && /hemorragia|via a[eé]rea|circula|trauma|xabcde/i.test(step)) {
    return xabcde.toUpperCase();
  }
  return String(index + 1);
}

/**
 * Shell premium — trilho clínico (ProtocolRailRow) + revelação ≤3.
 * Famílias: XABCDE, ADME, NSP, RCP sequencial.
 */
export function LogicRailShell({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
  accent = 'xabcde',
  applyTapBudget = true,
  eyebrow = 'Protocolo clínico',
}: LogicRailShellProps) {
  const palette = FOCUS_ACCENTS[accent] ?? FOCUS_ACCENTS.xabcde;
  const reduceMotion = useReducedMotion();

  const normalizedSteps = useMemo(() => {
    const raw = normalizeLogicFlowSteps(steps);
    return applyTapBudget ? applyProtocolTapBudget(raw) : raw;
  }, [steps, applyTapBudget]);

  const { advanceStep, isTapMode, isComplete, currentPasso, activeStepIndex } = useLogicFlowReveal(
    normalizedSteps.length,
    revealMode,
  );

  const handleAdvance = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${palette.chip}`}>
              {eyebrow}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-500">
              {Math.min(currentPasso, normalizedSteps.length)}/{normalizedSteps.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {normalizedSteps.map((step, index) => {
              const revealed = !isTapMode || index <= activeStepIndex;
              const active = isTapMode && !isComplete && index === activeStepIndex;
              const title = focusStepTitle(step, index, accent);
              if (!revealed) {
                return (
                  <div
                    key={index}
                    className="flex min-h-[44px] items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200/80 bg-slate-50/80 px-3 py-2 opacity-50"
                    aria-hidden
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 font-mono text-sm font-black text-slate-400">
                      {badgeForStep(step, index)}
                    </span>
                    <span className="font-body text-sm text-slate-400">••••••••</span>
                  </div>
                );
              }
              return (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProtocolRailRow
                    badge={badgeForStep(step, index)}
                    title={title}
                    detail={active || !isTapMode ? step : undefined}
                    tone={active ? 'command' : index < activeStepIndex || isComplete ? 'keep' : 'neutral'}
                    active={active}
                  />
                </motion.div>
              );
            })}
          </div>

          {isTapMode && !isComplete ? (
            <button
              type="button"
              onClick={handleAdvance}
              className={`mx-auto mt-1 flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-6 py-3 font-display text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] ${palette.tapBtn}`}
            >
              <Hand className="h-4 w-4" aria-hidden />
              Próximo elo
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {footerRule ? (
            <p className="mt-1 text-center font-body text-xs leading-relaxed text-slate-500">{footerRule}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
