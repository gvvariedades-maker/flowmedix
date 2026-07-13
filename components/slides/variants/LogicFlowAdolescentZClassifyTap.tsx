'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Hand, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  parseAdolescentZStep,
  Z_RAIL_MARKERS,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';

interface LogicFlowAdolescentZClassifyTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

function stepTone(kind: ReturnType<typeof parseAdolescentZStep>['kind']): string {
  switch (kind) {
    case 'classify_ok':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950';
    case 'eliminate':
    case 'threshold':
      return 'border-rose-300 bg-rose-50 text-rose-950';
    case 'mark':
      return 'border-sky-400 bg-sky-100 text-sky-950';
    case 'fixacao':
      return 'border-amber-300 bg-amber-50 text-amber-950';
    default:
      return 'border-slate-200 bg-white text-slate-900';
  }
}

export function LogicFlowAdolescentZClassifyTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowAdolescentZClassifyTapProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parseAdolescentZStep(step, index)),
    [normalized],
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set([0]));

  const total = parsed.length;
  const current = parsed[index];
  const isTap = revealMode === 'tap';

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = Math.max(0, Math.min(total - 1, i + dir));
        if (dir === 1) {
          setRevealed((prev) => new Set(prev).add(next));
        }
        return next;
      });
    },
    [total],
  );

  const revealNext = useCallback(() => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
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
              Toque em <span className="font-bold">Próximo</span> a cada passo
            </p>
            <p className="font-body text-[11px] leading-relaxed text-amber-900/85">
              Classifique letra por letra no trilho Z antes de marcar o gabarito.
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-1">
          {parsed.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                revealed.has(i) ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-sky-200/80 bg-sky-50/60 px-2 py-3">
          <div className="flex min-w-[260px] items-center justify-between">
            {Z_RAIL_MARKERS.map((marker) => (
              <span
                key={marker}
                className="font-mono text-[10px] font-bold tabular-nums text-slate-600"
              >
                {marker > 0 ? `+${marker}` : marker}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            className={`rounded-2xl border-2 p-4 shadow-sm ${stepTone(current.kind)}`}
          >
            <div className="mb-2 flex items-center gap-2">
              {current.kind === 'classify_ok' || current.kind === 'mark' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
              ) : current.kind === 'eliminate' || current.kind === 'threshold' ? (
                <XCircle className="h-5 w-5 shrink-0" aria-hidden />
              ) : null}
              {current.letter ? (
                <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-xs font-black">
                  {current.letter}
                </span>
              ) : null}
            </div>
            <p className="font-body text-sm leading-relaxed md:text-base">{current.raw}</p>
          </motion.div>
        </AnimatePresence>

        {isTap ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 disabled:opacity-40"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {index < total - 1 ? (
              <button
                type="button"
                onClick={revealNext}
                className="min-h-[44px] rounded-xl bg-sky-500 px-5 font-display text-sm font-bold text-white"
              >
                Próximo
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= total - 1}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 disabled:opacity-40"
              aria-label="Próximo passo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {footerRule ? (
          <p className="text-center font-body text-xs font-semibold text-sky-900">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
