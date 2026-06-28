'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Check, X } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parsePniVfStep, type ParsedPniVfStep } from '@/lib/slides/pniSlideUtils';

export type VfJuggleAccent = 'pni' | 'ist' | 'via' | 'farmaco' | 'trabalho' | 'respiratorio';

const STRATEGY_CHIP_LABEL: Record<VfJuggleAccent, string> = {
  pni: 'ESTRATÉGIA PNI',
  ist: 'ESTRATÉGIA IST',
  via: 'ESTRATÉGIA VIAS',
  farmaco: 'ESTRATÉGIA FARMACO',
  trabalho: 'ESTRATÉGIA NR-32',
  respiratorio: 'ESTRATÉGIA ASMA/DPOC',
};

const VF_JUGGLE_ACCENTS: Record<
  VfJuggleAccent,
  {
    chipLabel: string;
    chip: string;
    card: string;
    dotActive: string;
    dotRevealed: string;
    btnNext: string;
    btnReveal: string;
    btnSummary: string;
    footerSummary: string;
    stepTitle: string;
    letterChip: string;
  }
> = {
  pni: {
    chipLabel: 'V/F PNI',
    chip: 'border-lime-200/80 text-lime-800',
    card: 'border-lime-200/80 from-white via-lime-50/40 to-white',
    dotActive: 'bg-lime-500',
    dotRevealed: 'bg-emerald-400',
    btnNext: 'from-lime-500 to-emerald-600 shadow-lime-300/40',
    btnReveal: 'from-lime-500 to-emerald-600 shadow-lime-300/40',
    btnSummary: 'from-emerald-500 to-lime-600',
    footerSummary: 'border-lime-200/70 bg-lime-50/80 text-lime-900/80',
    stepTitle: 'text-lime-800',
    letterChip: 'from-lime-500 to-emerald-600 shadow-lime-300/40',
  },
  ist: {
    chipLabel: 'V/F IST',
    chip: 'border-fuchsia-200/80 text-fuchsia-900',
    card: 'border-fuchsia-200/80 from-white via-fuchsia-50/40 to-white',
    dotActive: 'bg-fuchsia-500',
    dotRevealed: 'bg-purple-400',
    btnNext: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-300/40',
    btnReveal: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-300/40',
    btnSummary: 'from-fuchsia-500 to-purple-600',
    footerSummary: 'border-fuchsia-200/70 bg-fuchsia-50/80 text-fuchsia-900/80',
    stepTitle: 'text-fuchsia-900',
    letterChip: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-300/40',
  },
  via: {
    chipLabel: 'V/F VIAS',
    chip: 'border-emerald-200/80 text-emerald-900',
    card: 'border-emerald-200/80 from-white via-emerald-50/40 to-white',
    dotActive: 'bg-emerald-500',
    dotRevealed: 'bg-teal-400',
    btnNext: 'from-emerald-500 to-teal-600 shadow-emerald-300/40',
    btnReveal: 'from-emerald-500 to-teal-600 shadow-emerald-300/40',
    btnSummary: 'from-emerald-500 to-teal-600',
    footerSummary: 'border-emerald-200/70 bg-emerald-50/80 text-emerald-900/80',
    stepTitle: 'text-emerald-900',
    letterChip: 'from-emerald-500 to-teal-600 shadow-emerald-300/40',
  },
  farmaco: {
    chipLabel: 'V/F FARMACO',
    chip: 'border-violet-200/80 text-violet-900',
    card: 'border-violet-200/80 from-white via-violet-50/40 to-white',
    dotActive: 'bg-violet-500',
    dotRevealed: 'bg-purple-400',
    btnNext: 'from-violet-500 to-purple-600 shadow-violet-300/40',
    btnReveal: 'from-violet-500 to-purple-600 shadow-violet-300/40',
    btnSummary: 'from-violet-500 to-purple-600',
    footerSummary: 'border-violet-200/70 bg-violet-50/80 text-violet-900/80',
    stepTitle: 'text-violet-900',
    letterChip: 'from-violet-500 to-purple-600 shadow-violet-300/40',
  },
  trabalho: {
    chipLabel: 'V/F NR-32',
    chip: 'border-amber-200/80 text-amber-900',
    card: 'border-amber-200/80 from-white via-amber-50/40 to-white',
    dotActive: 'bg-amber-500',
    dotRevealed: 'bg-orange-400',
    btnNext: 'from-amber-500 to-orange-600 shadow-amber-300/40',
    btnReveal: 'from-amber-500 to-orange-600 shadow-amber-300/40',
    btnSummary: 'from-amber-500 to-orange-600',
    footerSummary: 'border-amber-200/70 bg-amber-50/80 text-amber-900/80',
    stepTitle: 'text-amber-900',
    letterChip: 'from-amber-500 to-orange-600 shadow-amber-300/40',
  },
  respiratorio: {
    chipLabel: 'V/F ASMA/DPOC',
    chip: 'border-cyan-200/80 text-cyan-900',
    card: 'border-cyan-200/80 from-white via-cyan-50/40 to-white',
    dotActive: 'bg-cyan-500',
    dotRevealed: 'bg-teal-400',
    btnNext: 'from-cyan-500 to-teal-600 shadow-cyan-300/40',
    btnReveal: 'from-cyan-500 to-teal-600 shadow-cyan-300/40',
    btnSummary: 'from-cyan-500 to-teal-600',
    footerSummary: 'border-cyan-200/70 bg-cyan-50/80 text-cyan-900/80',
    stepTitle: 'text-cyan-900',
    letterChip: 'from-cyan-500 to-teal-600 shadow-cyan-300/40',
  },
};

interface LogicFlowPniVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
  /** `pni` = imunização (lime); `ist` = IST (fuchsia); `via` = vias (emerald). */
  accentVariant?: VfJuggleAccent;
}

function extractAnswerLetter(text: string): string | null {
  const match = text.match(/\bletra\s+([A-E])\b/i) ?? text.match(/\bmarcar\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function LetterChip({ letter, accent }: { letter: string; accent: VfJuggleAccent }) {
  const styles = VF_JUGGLE_ACCENTS[accent];
  return (
    <div
      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-3xl font-black text-white shadow-lg ${styles.letterChip}`}
    >
      {letter}
    </div>
  );
}

function JudgementBadge({ judgement }: { judgement: 'true' | 'false' }) {
  const isTrue = judgement === 'true';
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${
        isTrue
          ? 'border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-lime-50'
          : 'border-rose-300/70 bg-gradient-to-r from-rose-50 to-orange-50'
      }`}
    >
      <div className="mb-1 flex items-center justify-center gap-2">
        {isTrue ? (
          <Check className="h-5 w-5 text-emerald-700" strokeWidth={3} aria-hidden />
        ) : (
          <X className="h-5 w-5 text-rose-700" strokeWidth={3} aria-hidden />
        )}
        <p
          className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
            isTrue ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {isTrue ? 'Verdadeira' : 'Falsa'}
        </p>
      </div>
    </div>
  );
}

export function LogicFlowPniVfJuggleTap({
  steps,
  theme,
  footerRule,
  accentVariant = 'pni',
}: LogicFlowPniVfJuggleTapProps) {
  const accent = VF_JUGGLE_ACCENTS[accentVariant];
  const reduceMotion = useReducedMotion();
  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsedSteps = useMemo(
    () => normalizedSteps.map((step, index) => parsePniVfStep(step, index)),
    [normalizedSteps],
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [showSummary, setShowSummary] = useState(false);

  const total = parsedSteps.length;
  const current = parsedSteps[index];
  const isRevealed = revealed.has(index);
  const judgementSteps = parsedSteps.filter((s) => s.kind === 'judgement');
  const chipLabel =
    judgementSteps.length > 0 ? accent.chipLabel : STRATEGY_CHIP_LABEL[accentVariant];

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
      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
            <h2 className="mt-2 font-display text-xl font-black text-slate-900 md:text-2xl">
              Combinação julgada
            </h2>
            <p className="font-body text-sm text-slate-600">
              Revise o V/F de cada afirmativa antes de marcar a letra.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {judgementSteps.map((step, i) => {
              if (!step.roman || !step.judgement) return null;
              const isTrue = step.judgement === 'true';
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-center shadow-sm ${
                    isTrue
                      ? 'border-emerald-200/80 bg-emerald-50/90'
                      : 'border-rose-200/80 bg-rose-50/90'
                  }`}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {step.roman}
                  </p>
                  <p
                    className={`mt-1 font-display text-sm font-extrabold uppercase ${
                      isTrue ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {isTrue ? 'V' : 'F'}
                  </p>
                </div>
              );
            })}
          </div>

          {footerRule ? (
            <p
              className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${accent.footerSummary}`}
            >
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
  const needsReveal = current?.kind === 'judgement' && current.judgement;
  const canAdvance = !needsReveal || isRevealed;
  const canShowSummary = isLast && canAdvance;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${accent.chip}`}
          >
            {chipLabel}
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
              className={`rounded-2xl border bg-gradient-to-br p-5 shadow-lg md:p-6 ${accent.card}`}
            >
              <StepCard
                current={current}
                theme={theme}
                isRevealed={isRevealed}
                onReveal={revealCurrent}
                judgementSteps={judgementSteps}
                accentVariant={accentVariant}
              />
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
                i === index ? `w-6 ${accent.dotActive}` : revealed.has(i) ? `w-2 ${accent.dotRevealed}` : 'w-2 bg-slate-300/70'
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

          {canShowSummary && judgementSteps.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              className={`flex-1 rounded-2xl bg-gradient-to-r py-3.5 font-body text-sm font-bold text-white shadow-lg ${accent.btnSummary}`}
            >
              Ver combinação →
            </button>
          ) : (
            <button
              type="button"
              disabled={isLast || !canAdvance}
              onClick={() => go(1)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r py-3.5 font-body text-sm font-bold text-white shadow-lg disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none ${accent.btnNext}`}
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

function StepCard({
  current,
  theme,
  isRevealed,
  onReveal,
  judgementSteps,
  accentVariant = 'pni',
}: {
  current: ParsedPniVfStep | undefined;
  theme: ThemeColors;
  isRevealed: boolean;
  onReveal: () => void;
  judgementSteps: ParsedPniVfStep[];
  accentVariant?: VfJuggleAccent;
}) {
  const accent = VF_JUGGLE_ACCENTS[accentVariant];
  if (!current) return null;

  const Icon = resolveLucideIcon(
    current.kind === 'judgement' ? 'ListChecks' : current.kind === 'combine' ? 'Layers' : 'Syringe',
  );

  if (current.kind === 'judgement' && current.judgement) {
    return (
      <>
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg}`}>
            <Icon className={`h-5 w-5 ${theme.iconText}`} aria-hidden />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {current.title}
            </p>
            <p className="font-display text-xs font-semibold uppercase text-slate-600">Julgamento V/F</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-4 text-center shadow-inner">
          <p className="font-body text-sm font-semibold leading-relaxed text-slate-800 md:text-base">
            {current.question || current.text}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {isRevealed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <JudgementBadge judgement={current.judgement} />
              <p className="mt-3 font-body text-xs leading-relaxed text-slate-600">{current.text}</p>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onReveal}
              className={`mt-4 w-full rounded-xl bg-gradient-to-r py-3.5 font-body text-sm font-bold text-white shadow-md ${accent.btnReveal}`}
            >
              Julgar →
            </motion.button>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${accent.stepTitle}`}>
        {current.title}
      </p>
      {current.kind === 'locate' ? (
        (() => {
          const letter = extractAnswerLetter(current.text);
          return letter ? (
            <div className="my-4">
              <LetterChip letter={letter} accent={accentVariant} />
              <p className="mt-3 text-center font-body text-sm font-semibold text-slate-700">
                {current.text}
              </p>
            </div>
          ) : null;
        })()
      ) : null}
      {current.kind === 'combine' ? (
        <div className="my-4 flex flex-wrap justify-center gap-2">
          {judgementSteps
            .filter((s) => s.judgement === 'true' && s.roman)
            .map((s) => (
              <span
                key={s.roman}
                className="rounded-xl border border-emerald-300/70 bg-emerald-50 px-3 py-2 font-display text-sm font-black text-emerald-800"
              >
                {s.roman}
              </span>
            ))}
        </div>
      ) : null}
      {current.kind !== 'locate' || !extractAnswerLetter(current.text) ? (
        <p className="mt-3 font-body text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
          {current.text}
        </p>
      ) : null}
    </>
  );
}
