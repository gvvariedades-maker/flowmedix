'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseTranslationStep } from '@/lib/slides/vitalsSlideUtils';
import { cn } from '@/lib/utils';
import {
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  PolarityPanel,
  boardTone,
} from '../primitives';

interface LogicFlowVitalsTranslateTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Tradução SV — chassis G2 (BoardChrome + CriticalNumber + PolarityPanel).
 * Mantém Traduzir → / resumo (P1 lote 4).
 */
export function LogicFlowVitalsTranslateTap({
  steps,
  theme,
  footerRule,
}: LogicFlowVitalsTranslateTapProps) {
  const reduceMotion = useReducedMotion();
  const keepTone = boardTone('keep');
  const warnTone = boardTone('warn');
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

  if (normalizedSteps.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <BoardChrome
        theme={theme}
        washOpacity={0.4}
        eyebrow="Sinais vitais"
        title="Tradução completa"
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="lg"
      >
        <p className="text-center font-body text-sm text-slate-600">
          Todos os sinais vitais do caso traduzidos para termos clínicos.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {translationSteps.map((step, i) => {
            if (step.kind !== 'translation') return null;
            const Icon = resolveLucideIcon(step.iconName);
            return (
              <PolarityPanel key={i} tone="keep">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-700" aria-hidden />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {step.rawValue}
                  </span>
                </div>
                <p className="mt-1 font-display text-sm font-extrabold uppercase tracking-wide text-emerald-800">
                  {step.clinicalTerm}
                </p>
              </PolarityPanel>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowSummary(false)}
          className="rounded-2xl border-2 border-slate-200 bg-white py-3 font-body text-sm font-bold text-slate-700 shadow-sm"
        >
          ← Revisar passos
        </button>
      </BoardChrome>
    );
  }

  const isLast = index >= total - 1;
  const canShowSummary = isLast && (current?.kind !== 'translation' || isRevealed);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="Tradução SV"
      footerRule={!canShowSummary ? footerRule : undefined}
      footerLabel={!canShowSummary && footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="lg"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryStrip label={`${index + 1}/${total}`} tone="warn" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Valor → termo
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={reduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
        >
          {current?.kind === 'translation' ? (
            <PolarityPanel tone={isRevealed ? 'keep' : 'warn'} emphasized={isRevealed}>
              <div className="mb-3 flex items-center gap-3">
                {(() => {
                  const Icon = resolveLucideIcon(current.iconName);
                  return (
                    <div
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl',
                        isRevealed ? keepTone.badge : warnTone.badge,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" aria-hidden />
                    </div>
                  );
                })()}
                <div>
                  <CategoryStrip label={current.svName} tone={isRevealed ? 'keep' : 'warn'} />
                  <p className="mt-1 font-display text-xs font-semibold uppercase text-slate-600">
                    Valor aferido
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <CriticalNumber
                  value={current.rawValue}
                  label="Aferido"
                  emphasis={isRevealed ? 'ok' : 'alert'}
                />
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
                    className="mt-4 rounded-xl border-2 border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-center"
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
                    className={cn(
                      'mt-4 w-full rounded-xl py-3.5 font-body text-sm font-bold text-white shadow-md',
                      warnTone.badge,
                    )}
                  >
                    Traduzir →
                  </motion.button>
                )}
              </AnimatePresence>
            </PolarityPanel>
          ) : (
            <PolarityPanel tone="command">
              <CategoryStrip label={current?.title ?? 'Passo'} tone="command" />
              <p className="mt-3 font-body text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
                {current?.text}
              </p>
            </PolarityPanel>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5" role="list" aria-label="Progresso">
        {parsedSteps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === index
                ? cn('w-6', warnTone.accent)
                : revealed.has(i)
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-300/70',
            )}
            aria-label={`Passo ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => go(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-35"
          aria-label="Passo anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {canShowSummary && allTranslated ? (
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-body text-sm font-bold text-white shadow-lg',
              keepTone.badge,
            )}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Ver resumo →
          </button>
        ) : (
          <button
            type="button"
            disabled={isLast || (current?.kind === 'translation' && !isRevealed)}
            onClick={() => go(1)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-body text-sm font-bold text-white shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
              warnTone.badge,
            )}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </BoardChrome>
  );
}
