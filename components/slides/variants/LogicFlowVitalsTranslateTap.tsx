'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  inferSvIconName,
  parseTranslationStep,
} from '@/lib/slides/vitalsSlideUtils';

interface LogicFlowVitalsTranslateTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

export function LogicFlowVitalsTranslateTap({ steps, theme, footerRule }: LogicFlowVitalsTranslateTapProps) {
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parseTranslationStep(step, index)),
    [normalizedSteps],
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [showSummary, setShowSummary] = useState(false);

  const total = parsedSteps.length;
  const current = parsedSteps[index];
  const isRevealed = revealed.has(index);
  const translationSteps = parsedSteps.filter((s) => s.kind === 'translation');
  const allTranslated = parsedSteps.every(
    (step, idx) => step.kind !== 'translation' || revealed.has(idx),
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + dir)));
    },
    [total],
  );

  const revealCurrent = useCallback(() => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, [index]);

  const openSummary = useCallback(() => {
    setShowSummary(true);
  }, []);

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
            <h2 className="mt-2 font-display text-xl font-black text-slate-900 md:text-2xl">
              Tradução completa
            </h2>
            <p className="font-body text-sm text-slate-600">
              Todos os sinais vitais do caso traduzidos para termos clínicos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {translationSteps.map((step, i) => {
              if (step.kind !== 'translation') return null;
              const Icon = resolveLucideIcon(step.iconName);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-rose-600" aria-hidden />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      {step.rawValue}
                    </span>
                  </div>
                  <p className="mt-1 font-display text-sm font-extrabold uppercase tracking-wide text-emerald-800">
                    {step.clinicalTerm}
                  </p>
                </div>
              );
            })}
          </div>

          {footerRule ? (
            <p className="rounded-xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-center font-body text-sm italic text-rose-900/80">
              {footerRule}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setShowSummary(false)}
            className="rounded-2xl border border-slate-200 bg-white py-3 font-body text-sm font-bold text-slate-700 shadow-sm"
          >
            ← Revisar passos
          </button>
        </div>
      </div>
    );
  }

  const isLast = index >= total - 1;
  const canShowSummary = isLast && (current?.kind !== 'translation' || isRevealed);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700">
            Tradução SV
          </span>
          <span className="font-mono text-sm font-black tabular-nums text-slate-700">
            {index + 1}
            <span className="text-slate-400">/{total}</span>
          </span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/40 to-white p-5 shadow-lg md:p-6"
            >
              {current?.kind === 'translation' ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    {(() => {
                      const Icon = resolveLucideIcon(current.iconName);
                      return (
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg}`}>
                          <Icon className={`h-5 w-5 ${theme.iconText}`} aria-hidden />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {current.svName}
                      </p>
                      <p className="font-display text-xs font-semibold uppercase text-slate-600">
                        Valor aferido
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-5 text-center shadow-inner">
                    <p className="font-display text-3xl font-black tabular-nums text-slate-900 md:text-4xl">
                      {current.rawValue}
                    </p>
                  </div>

                  {current.referenceRange ? (
                    <p className="mt-3 text-center font-body text-xs text-slate-500">
                      Faixa normal:{' '}
                      <span className="font-semibold text-slate-700">{current.referenceRange}</span>
                    </p>
                  ) : null}

                  <AnimatePresence initial={false}>
                    {isRevealed ? (
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-center"
                      >
                        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                          Tradução clínica
                        </p>
                        <p className="mt-1 font-display text-lg font-extrabold uppercase tracking-wide text-emerald-900 md:text-xl">
                          {current.clinicalTerm}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={revealCurrent}
                        className="mt-4 w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3.5 font-body text-sm font-bold text-white shadow-md shadow-rose-300/40"
                      >
                        Traduzir →
                      </motion.button>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700">
                    {current?.title ?? 'Passo'}
                  </p>
                  <p className="mt-3 font-body text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
                    {current?.text}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {parsedSteps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-rose-500' : revealed.has(i) ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-300/70'
              }`}
              aria-label={`Passo ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-35"
            aria-label="Passo anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {canShowSummary && allTranslated ? (
            <button
              type="button"
              onClick={openSummary}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-body text-sm font-bold text-white shadow-lg"
            >
              Ver resumo →
            </button>
          ) : (
            <button
              type="button"
              disabled={isLast || (current?.kind === 'translation' && !isRevealed)}
              onClick={() => go(1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 py-3.5 font-body text-sm font-bold text-white shadow-lg disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {footerRule && !canShowSummary ? (
          <p className="mt-3 text-center font-body text-xs italic text-slate-500">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
