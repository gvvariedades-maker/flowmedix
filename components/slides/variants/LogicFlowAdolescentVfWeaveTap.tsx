'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Hand, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseAdolescentVfWeaveStep } from '@/lib/slides/adolescentSlideUtils';
import { cn } from '@/lib/utils';
import {
  useLogicFlowReveal,
  shouldShowLogicFlowTapHint,
} from './logicFlowReveal';
import {
  BoardChrome,
  CategoryStrip,
  PolarityPanel,
  boardTone,
} from '../primitives';

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
  const keep = boardTone('keep');
  const exception = boardTone('exception');
  const command = boardTone('command');

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-black transition-all',
          active
            ? cn(command.badge, command.badgeText, 'shadow-lg ring-2 ring-sky-300/50')
            : 'border-2 border-sky-200/80 bg-white text-sky-700',
        )}
      >
        {roman}
      </div>
      <div className="relative flex w-2 flex-1 min-h-[72px] flex-col items-center overflow-hidden rounded-full bg-sky-100/80">
        <motion.div
          className={cn(
            'w-full rounded-full',
            !hasJudgement
              ? 'h-full bg-sky-200/60'
              : isTrue
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-b from-rose-300 to-rose-500',
          )}
          initial={{ height: 0 }}
          animate={{ height: hasJudgement ? '100%' : '20%' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
      {hasJudgement ? (
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-white',
            isTrue ? keep.badge : exception.badge,
          )}
        >
          {isTrue ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
        </span>
      ) : (
        <span className="h-7 w-7 rounded-full border border-dashed border-sky-300/80" aria-hidden />
      )}
    </div>
  );
}

/**
 * VF Adolescente — chassis G2 (BoardChrome + PolarityPanel).
 * Mantém o gesto dos fios I/II/III até a letra (P1 lote 4).
 */
export function LogicFlowAdolescentVfWeaveTap({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentVfWeaveTapProps) {
  const reduceMotion = useReducedMotion();
  const keepTone = boardTone('keep');
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

  const isCombine = activeParsed?.kind === 'combine';
  const panelTone = isCombine && showLetter ? 'keep' : 'command';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="V/F · Saúde do Adolescente"
      footerRule={footerRule && isComplete ? footerRule : undefined}
      footerLabel={footerRule && isComplete ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="lg"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryStrip
          label={`${Math.min(currentPasso, parsedSteps.length)}/${parsedSteps.length}`}
          tone="command"
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Tece os fios
        </span>
      </div>

      {showTapHint ? (
        <div
          role="status"
          className="flex flex-col items-center gap-1 rounded-xl border-2 border-sky-200/80 bg-sky-50/90 px-4 py-2.5 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-sky-900">
            <Hand className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Toque em <span className="font-bold">Próximo</span>
          </p>
          <p className="font-body text-xs text-sky-800/85">
            Cada toque preenche um fio (I, II ou III) até montar a letra.
          </p>
        </div>
      ) : null}

      <div className="flex items-end justify-center gap-3 px-2" role="list" aria-label="Fios V/F">
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
        >
          <PolarityPanel tone={panelTone} emphasized={Boolean(isCombine && showLetter)}>
            <CategoryStrip
              label={activeParsed?.title ?? `Passo ${activeStepIndex + 1}`}
              tone={panelTone}
            />
            <p className="mt-3 font-body text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
              {activeParsed?.text}
            </p>

            {showLetter && answerLetter && isCombine ? (
              <motion.div
                initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-3"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                  Fios verdadeiros →
                </span>
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl font-black shadow-lg',
                    keepTone.badge,
                    keepTone.badgeText,
                  )}
                >
                  {answerLetter}
                </span>
              </motion.div>
            ) : null}
          </PolarityPanel>
        </motion.div>
      </AnimatePresence>

      {isTapMode && !isComplete ? (
        <button
          type="button"
          onClick={handleAdvance}
          className="mx-auto flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-600 px-6 py-3 font-body text-sm font-bold text-white shadow-lg"
        >
          <Hand className="h-4 w-4" aria-hidden />
          Próximo
        </button>
      ) : null}

      {isComplete ? (
        <p className="text-center font-mono text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          Raciocínio completo · {revealedSteps.length} passos
        </p>
      ) : null}
    </BoardChrome>
  );
}
