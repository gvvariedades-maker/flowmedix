'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Hand, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseAdolescentExcetoStep } from '@/lib/slides/adolescentSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';

interface LogicFlowAdolescentExcetoIsolateTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

function tone(kind: ReturnType<typeof parseAdolescentExcetoStep>['kind']): string {
  switch (kind) {
    case 'command':
      return 'border-sky-300 bg-sky-50 text-sky-950';
    case 'keep':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950';
    case 'exception':
      return 'border-rose-300 bg-rose-50 text-rose-950';
    case 'mark':
      return 'border-sky-400 bg-sky-100 text-sky-950';
    case 'transfer':
      return 'border-amber-300 bg-amber-50 text-amber-950';
    default:
      return 'border-slate-200 bg-white text-slate-900';
  }
}

/** Isola a EXCETO/INCORRETA em poucos taps — sem fios I/II/III. */
export function LogicFlowAdolescentExcetoIsolateTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowAdolescentExcetoIsolateTapProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parseAdolescentExcetoStep(step, index)),
    [normalized],
  );

  const [index, setIndex] = useState(0);
  const total = parsed.length;
  const isTap = revealMode === 'tap';
  const current = parsed[index];

  const revealNext = useCallback(() => {
    if (index < total - 1) setIndex((i) => i + 1);
  }, [index, total]);

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        {isTap ? (
          <div
            role="status"
            className="flex flex-col items-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-center"
          >
            <p className="flex items-center justify-center gap-2 font-body text-xs font-semibold text-amber-950">
              <Hand className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
              Isolar a única conduta que afasta o adolescente
            </p>
          </div>
        ) : null}

        <div className="flex justify-center gap-1.5" aria-hidden>
          {parsed.map((p, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= index
                  ? p.kind === 'exception' || p.kind === 'mark'
                    ? 'bg-rose-400'
                    : 'bg-emerald-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            className={`rounded-2xl border-2 p-4 shadow-sm md:p-5 ${tone(current.kind)}`}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80">
              {current.title}
              {current.letter ? ` · ${current.letter}` : ''}
            </p>
            <p className="mt-2 font-body text-base font-semibold leading-snug md:text-lg">
              {current.kind === 'exception' ? (
                <span className="inline-flex items-start gap-2">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>{current.text}</span>
                </span>
              ) : current.kind === 'keep' || current.kind === 'mark' ? (
                <span className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>{current.text}</span>
                </span>
              ) : (
                current.text
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        <p className="text-center font-mono text-[10px] font-bold uppercase text-slate-500">
          Passo {index + 1} de {total}
        </p>

        {isTap && index < total - 1 ? (
          <button
            type="button"
            onClick={revealNext}
            className="mx-auto min-h-[44px] rounded-xl border border-emerald-300 bg-emerald-50 px-5 font-body text-sm font-bold text-emerald-900 hover:bg-emerald-100"
          >
            Próximo passo &gt;
          </button>
        ) : null}

        {footerRule && (!isTap || index >= total - 1) ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
