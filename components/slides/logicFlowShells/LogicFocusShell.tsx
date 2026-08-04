'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';
import { cn } from '@/lib/utils';
import {
  useLogicFlowReveal,
  type LogicFlowRevealMode,
} from '../variants/logicFlowReveal';
import {
  BoardChrome,
  CategoryStrip,
  PolarityPanel,
  boardTone,
  type BoardTone,
} from '../primitives';
import {
  FOCUS_ACCENTS,
  PROTOCOL_SHELL_ACCENTS,
  focusStepTitle,
  type LogicFlowShellAccent,
} from './focusAccents';

export type LogicFocusHeaderContext = {
  activeStepIndex: number;
  isComplete: boolean;
  currentPasso: number;
  totalSteps: number;
};

export interface LogicFocusShellProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  accent?: LogicFlowShellAccent;
  /** Override: força budget ≤3. Default: on para PROTOCOL_SHELL_ACCENTS + clinical genérico. */
  applyTapBudget?: boolean;
  /** Eyebrow no topo (ex.: Checklist de procedimento). */
  eyebrow?: string;
  /** Slot estático acima do card (letras VF, trilho, etc.). */
  headerSlot?: ReactNode;
  /** Slot reativo ao progresso (ex.: letter rail Mulher). Preferir sobre headerSlot quando precisar do índice. */
  renderHeader?: (ctx: LogicFocusHeaderContext) => ReactNode;
}

/** Tom do board a partir do accent de domínio (cor = decisão, não decoração). */
function focusBoardTone(accent: LogicFlowShellAccent, isGabarito: boolean): BoardTone {
  if (isGabarito) return 'keep';
  switch (accent) {
    case 'urgencias':
    case 'stroke':
    case 'shock':
    case 'choking':
    case 'pediatric':
      return 'warn';
    case 'xabcde':
      return 'warn';
    case 'sonda':
      return 'rights';
    case 'cam':
    case 'seguranca':
    case 'clinical':
      return 'teal';
    default:
      return 'command';
  }
}

/**
 * Shell premium — 1 decisão visível + progresso + CTA.
 * Chassis G2: BoardChrome + PolarityPanel (barra visual + ratchet).
 * Substitui pilhas verticais de N cards (StepLadder legado / genérico tap).
 */
export function LogicFocusShell({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
  accent = 'clinical',
  applyTapBudget,
  eyebrow,
  headerSlot,
  renderHeader,
}: LogicFocusShellProps) {
  const palette = FOCUS_ACCENTS[accent] ?? FOCUS_ACCENTS.clinical;
  const reduceMotion = useReducedMotion();
  const shouldBudget =
    applyTapBudget ?? (PROTOCOL_SHELL_ACCENTS.has(accent) || accent === 'default' || accent === 'cam');

  const normalizedSteps = useMemo(() => {
    const raw = normalizeLogicFlowSteps(steps);
    return shouldBudget ? applyProtocolTapBudget(raw) : raw;
  }, [steps, shouldBudget]);

  const {
    advanceStep,
    isTapMode,
    isComplete,
    currentPasso,
    activeStepIndex,
  } = useLogicFlowReveal(normalizedSteps.length, revealMode);

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

  const current = normalizedSteps[Math.min(activeStepIndex, normalizedSteps.length - 1)];
  const title = focusStepTitle(current, activeStepIndex, accent);
  const isGabarito = /gabarito|marcar a letra|identificar o gabarito/i.test(current);
  const stepTone = focusBoardTone(accent, isGabarito || isComplete);
  const tone = boardTone(stepTone);
  const stepLabel = isGabarito
    ? 'Gabarito'
    : accent === 'sonda'
      ? `Etapa ${activeStepIndex + 1}`
      : `Passo ${activeStepIndex + 1}`;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow={eyebrow ?? 'Decisão clínica'}
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="lg"
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryStrip
          label={`${Math.min(currentPasso, normalizedSteps.length)}/${normalizedSteps.length}`}
          tone={stepTone}
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Uma decisão por vez
        </span>
      </div>

      <div className="flex items-center justify-center gap-1.5" role="list" aria-label="Progresso dos passos">
        {normalizedSteps.map((_, index) => {
          const done = index < activeStepIndex || (isComplete && index <= activeStepIndex);
          const active = !isComplete && index === activeStepIndex;
          return (
            <span
              key={index}
              role="listitem"
              className={cn(
                'h-2 rounded-full transition-all',
                active ? cn('w-6', tone.accent) : done ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200',
              )}
              aria-current={active ? 'step' : undefined}
            />
          );
        })}
      </div>

      {renderHeader
        ? renderHeader({
            activeStepIndex,
            isComplete,
            currentPasso,
            totalSteps: normalizedSteps.length,
          })
        : headerSlot}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStepIndex}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          <PolarityPanel tone={stepTone} emphasized={isGabarito || isComplete}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1.5">
                <CategoryStrip label={stepLabel} tone={stepTone} />
                <p className="font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
                  {title}
                </p>
              </div>
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold shadow-md',
                  tone.badge,
                  tone.badgeText,
                )}
              >
                {isComplete || isGabarito ? <Check className="h-5 w-5" strokeWidth={3} /> : activeStepIndex + 1}
              </span>
            </div>
            <p className={cn('font-body text-sm leading-relaxed md:text-[15px]', tone.text)}>{current}</p>
          </PolarityPanel>
        </motion.div>
      </AnimatePresence>

      {isTapMode && !isComplete ? (
        <button
          type="button"
          onClick={handleAdvance}
          className={cn(
            'mx-auto flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-6 py-3 font-body text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            palette.tapBtn,
          )}
        >
          <Hand className="h-4 w-4" aria-hidden />
          Próximo passo
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      {isComplete ? (
        <p className="text-center font-mono text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          Raciocínio completo
        </p>
      ) : null}
    </BoardChrome>
  );
}
