'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parsePniVfStep, type ParsedPniVfStep } from '@/lib/slides/pniSlideUtils';
import { cn } from '@/lib/utils';
import {
  BoardChrome,
  CategoryStrip,
  PolarityPanel,
  boardTone,
  type BoardTone,
} from '../primitives';

export type VfJuggleAccent =
  | 'pni'
  | 'ist'
  | 'via'
  | 'farmaco'
  | 'trabalho'
  | 'respiratorio'
  | 'cam'
  | 'biosseg'
  | 'seguranca'
  | 'peri';

const STRATEGY_CHIP_LABEL: Record<VfJuggleAccent, string> = {
  pni: 'ESTRATÉGIA PNI',
  ist: 'ESTRATÉGIA IST',
  via: 'ESTRATÉGIA VIAS',
  farmaco: 'ESTRATÉGIA FARMACO',
  trabalho: 'ESTRATÉGIA NR-32',
  respiratorio: 'ESTRATÉGIA ASMA/DPOC',
  cam: 'ESTRATÉGIA 9 CERTOS',
  biosseg: 'ESTRATÉGIA IRAS',
  seguranca: 'ESTRATÉGIA NSP',
  peri: 'ESTRATÉGIA SRPA',
};

const VF_CHIP_LABEL: Record<VfJuggleAccent, string> = {
  pni: 'V/F PNI',
  ist: 'V/F IST',
  via: 'V/F VIAS',
  farmaco: 'V/F FARMACO',
  trabalho: 'V/F NR-32',
  respiratorio: 'V/F ASMA/DPOC',
  cam: 'V/F MEDICAÇÃO',
  biosseg: 'V/F IRAS',
  seguranca: 'V/F NSP',
  peri: 'V/F PERI',
};

function vfAccentTone(accent: VfJuggleAccent): BoardTone {
  switch (accent) {
    case 'pni':
    case 'biosseg':
      return 'lime';
    case 'via':
    case 'cam':
    case 'respiratorio':
      return 'teal';
    case 'farmaco':
    case 'peri':
    case 'ist':
      return 'rights';
    case 'trabalho':
    case 'seguranca':
      return 'warn';
    default:
      return 'command';
  }
}

function extractAnswerLetter(text: string): string | null {
  const match = text.match(/\bletra\s+([A-E])\b/i) ?? text.match(/\bmarcar\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

interface LogicFlowPniVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
  accentVariant?: VfJuggleAccent;
  chipLabel?: string;
}

function JudgementBadge({ judgement }: { judgement: 'true' | 'false' }) {
  const isTrue = judgement === 'true';
  return (
    <PolarityPanel tone={isTrue ? 'keep' : 'exception'} emphasized>
      <div className="flex items-center justify-center gap-2">
        {isTrue ? (
          <Check className="h-5 w-5 text-emerald-700" strokeWidth={3} aria-hidden />
        ) : (
          <X className="h-5 w-5 text-rose-700" strokeWidth={3} aria-hidden />
        )}
        <p
          className={cn(
            'font-mono text-[10px] font-bold uppercase tracking-widest',
            isTrue ? 'text-emerald-700' : 'text-rose-700',
          )}
        >
          {isTrue ? 'Verdadeira' : 'Falsa'}
        </p>
      </div>
    </PolarityPanel>
  );
}

/**
 * Hub V/F — chassis G2 (BoardChrome + PolarityPanel).
 * Mantém julgamento tap + resumo; clones (Via/Cam/…) só passam accentVariant.
 */
export function LogicFlowPniVfJuggleTap({
  steps,
  theme,
  footerRule,
  accentVariant = 'pni',
  chipLabel: chipLabelOverride,
}: LogicFlowPniVfJuggleTapProps) {
  const tone = vfAccentTone(accentVariant);
  const toneClasses = boardTone(tone);
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
    chipLabelOverride?.trim() ||
    (judgementSteps.length > 0 ? VF_CHIP_LABEL[accentVariant] : STRATEGY_CHIP_LABEL[accentVariant]);

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
        eyebrow={chipLabel}
        title="Combinação julgada"
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="lg"
      >
        <p className="text-center font-body text-sm text-slate-600">
          Revise o V/F de cada afirmativa antes de marcar a letra.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {judgementSteps.map((step, i) => {
            if (!step.roman || !step.judgement) return null;
            const isTrue = step.judgement === 'true';
            return (
              <PolarityPanel key={i} tone={isTrue ? 'keep' : 'exception'}>
                <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {step.roman}
                </p>
                <p
                  className={cn(
                    'mt-1 text-center font-body text-sm font-extrabold uppercase',
                    isTrue ? 'text-emerald-800' : 'text-rose-800',
                  )}
                >
                  {isTrue ? 'V' : 'F'}
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
  const needsReveal = current?.kind === 'judgement' && current.judgement;
  const canAdvance = !needsReveal || isRevealed;
  const canShowSummary = isLast && canAdvance;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow={chipLabel}
      footerRule={!canShowSummary ? footerRule : undefined}
      footerLabel={!canShowSummary && footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="lg"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryStrip label={`${index + 1}/${total}`} tone={tone} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Juggle V/F
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
          <StepCard
            current={current}
            isRevealed={isRevealed}
            onReveal={revealCurrent}
            judgementSteps={judgementSteps}
            tone={tone}
          />
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
                ? cn('w-6', toneClasses.accent)
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

        {canShowSummary && judgementSteps.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-body text-sm font-bold text-white shadow-lg',
              toneClasses.badge,
            )}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Ver combinação →
          </button>
        ) : (
          <button
            type="button"
            disabled={isLast || !canAdvance}
            onClick={() => go(1)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-body text-sm font-bold text-white shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
              toneClasses.badge,
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

function StepCard({
  current,
  isRevealed,
  onReveal,
  judgementSteps,
  tone,
}: {
  current: ParsedPniVfStep | undefined;
  isRevealed: boolean;
  onReveal: () => void;
  judgementSteps: ParsedPniVfStep[];
  tone: BoardTone;
}) {
  if (!current) return null;
  const t = boardTone(tone);

  if (current.kind === 'judgement' && current.judgement) {
    return (
      <PolarityPanel tone={tone}>
        <CategoryStrip label={current.title} tone={tone} />
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Julgamento V/F
        </p>
        <div className="mt-3 rounded-xl border border-slate-200/80 bg-white px-4 py-4 text-center shadow-inner">
          <p className="font-body text-sm font-semibold leading-relaxed text-slate-800 md:text-base">
            {current.question || current.text}
          </p>
        </div>
        <AnimatePresence initial={false}>
          {isRevealed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-2"
            >
              <JudgementBadge judgement={current.judgement} />
              <p className="font-body text-xs leading-relaxed text-slate-600">{current.text}</p>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onReveal}
              className={cn(
                'mt-3 w-full rounded-xl py-3.5 font-body text-sm font-bold text-white shadow-md',
                t.badge,
              )}
            >
              Julgar →
            </motion.button>
          )}
        </AnimatePresence>
      </PolarityPanel>
    );
  }

  const letter = current.kind === 'locate' ? extractAnswerLetter(current.text) : null;

  return (
    <PolarityPanel tone={current.kind === 'locate' ? 'keep' : tone} emphasized={current.kind === 'locate'}>
      <CategoryStrip label={current.title} tone={current.kind === 'locate' ? 'keep' : tone} />
      {letter ? (
        <div className="my-4 flex flex-col items-center gap-2">
          <span
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl font-body text-3xl font-black text-white shadow-lg',
              boardTone('keep').badge,
            )}
          >
            {letter}
          </span>
          <p className="text-center font-body text-sm font-semibold text-slate-700">{current.text}</p>
        </div>
      ) : null}
      {current.kind === 'combine' ? (
        <div className="my-4 flex flex-wrap justify-center gap-2">
          {judgementSteps
            .filter((s) => s.judgement === 'true' && s.roman)
            .map((s) => (
              <CategoryStrip key={s.roman} label={s.roman!} tone="keep" />
            ))}
        </div>
      ) : null}
      {current.kind !== 'locate' || !letter ? (
        <p className={cn('mt-3 font-body text-base font-semibold leading-relaxed md:text-lg', t.text)}>
          {current.text}
        </p>
      ) : null}
    </PolarityPanel>
  );
}
