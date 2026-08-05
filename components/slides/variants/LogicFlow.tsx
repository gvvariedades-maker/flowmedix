'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle2, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  useLogicFlowReveal,
  isStepRevealed,
  isStepFuture,
  isStepActive,
  shouldShowLogicFlowTapHint,
  type LogicFlowRevealMode,
} from './logicFlowReveal';
import { LogicFlowFooter } from './LogicFlowFooter';
import { SLIDE_CARD } from '../core/slideSurface';
import {
  getLogicFlowStepVisual,
  logicFlowCardsGridClass,
  logicFlowStepCardClass,
  logicFlowStepIconClass,
} from '../core/logicFlowStepStyles';
import { getLogicFlowBespoke } from '../registry/logicFlow';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  layoutVariant?: string;
  /** Default `auto` preserva slides legados; premium usa `reveal_mode: "tap"` no JSON. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  /** Override do chip interno (ex.: INSULINA · VIAS no molde via-vf-juggle-tap). */
  chipLabel?: string;
  /** Override do eyebrow do FocusShell (PT → «Estratégia de prova»). */
  focusEyebrow?: string;
}

/** Destaca a expressão "estudo reverso" (qualquer caixa) no texto do passo. */
const ESTUDO_REVERSO_RE = /(estudo\s+reverso)/gi;

function renderStepContent(text: string, isRevealed: boolean, theme: ThemeColors) {
  const highlightClass = isRevealed
    ? `font-bold ${theme.textSecondary}`
    : 'font-semibold text-slate-500/70';
  const parts = text.split(ESTUDO_REVERSO_RE);
  return parts.map((part, i) => {
    if (/^estudo\s+reverso$/i.test(part)) {
      return (
        <span key={i} className={highlightClass} title="Estudo reverso">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderStepText(
  step: string,
  isRevealed: boolean,
  isFuture: boolean,
  isTapMode: boolean,
  theme: ThemeColors,
) {
  if (isTapMode && isFuture) {
    return (
      <span className="select-none text-slate-600/80" aria-hidden>
        ••••••••••••••••
      </span>
    );
  }
  return renderStepContent(step, isRevealed, theme);
}

function LogicFlowTimelineDot({ revealed }: { revealed: boolean }) {
  return (
    <div
      className={[
        'absolute -left-[22px] top-5 z-10 h-3 w-3 rounded-full border-2 shadow-sm md:-left-[23px]',
        revealed ? 'border-emerald-500 bg-emerald-500' : 'border-blue-600 bg-white',
      ].join(' ')}
      aria-hidden
    />
  );
}

function LogicFlowConnector({ active }: { active: boolean }) {
  if (!active) {
    return <div className="h-2" aria-hidden />;
  }
  return <div className="h-3" aria-hidden />;
}

function LogicFlowTapBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: [1, 0.7, 1], y: 0 }}
      transition={{
        opacity: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        y: { duration: 0.25 },
      }}
      className="pointer-events-none absolute -top-2 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white shadow-md"
    >
      <Hand className="h-3 w-3 shrink-0" aria-hidden />
      Toque aqui
    </motion.span>
  );
}

// ============================================================================
// FLUXO LÓGICO: sequência vertical/horizontal/cards com revelação auto ou tap
// layout_variant: vertical | horizontal | cards
// reveal_mode: auto (padrão) | tap (opt-in no JSON)
// ============================================================================
export const LogicFlow = ({
  steps,
  theme,
  layoutVariant = 'vertical',
  revealMode = 'auto',
  footerRule,
  chipLabel,
  focusEyebrow,
}: LogicFlowProps) => {
  const variant = layoutVariant || 'vertical';

  const normalizedSteps = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  const {
    revealedSteps,
    advanceStep,
    isTapMode,
    isComplete,
    currentPasso,
    activeStepIndex,
  } = useLogicFlowReveal(normalizedSteps.length, revealMode);

  const showTapHint = shouldShowLogicFlowTapHint(
    isTapMode,
    isComplete,
    normalizedSteps.length,
    activeStepIndex,
  );

  const handleAdvance = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const bespoke = getLogicFlowBespoke(variant);
  if (bespoke) {
    const Comp = bespoke.Component;
    return (
      <Comp
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
        chipLabel={chipLabel}
      />
    );
  }

  if (!normalizedSteps || normalizedSteps.length === 0) {
    return (
      <motion.div className="flex min-h-full w-full min-w-0 items-center justify-center p-6">
        <p className="font-body text-base text-slate-400">Nenhum passo definido</p>
      </motion.div>
    );
  }

  // Fase A — genéricos em tap: FocusShell (sem pilha de N cards).
  if (isTapMode) {
    return (
      <LogicFocusShell
        steps={normalizedSteps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
        eyebrow={focusEyebrow}
        accent="clinical"
        applyTapBudget
      />
    );
  }

  const footer = (
    <LogicFlowFooter
      isTapMode={isTapMode}
      isComplete={isComplete}
      currentPasso={currentPasso}
      total={normalizedSteps.length}
      revealedCount={revealedSteps.length}
      onAdvance={handleAdvance}
      showTapHint={showTapHint}
    />
  );

  const baseBg = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
    </>
  );

  const getStepState = (index: number) => {
    const revealed = isStepRevealed(index, revealedSteps);
    const future = isStepFuture(index, revealedSteps);
    const active = isStepActive(index, revealedSteps, isTapMode);
    return { revealed, future, active };
  };

  const handleStepActivate = (index: number) => {
    if (!isTapMode || isComplete) return;
    const { active } = getStepState(index);
    if (active) handleAdvance();
  };

  // VARIANTE: HORIZONTAL
  if (variant === 'horizontal') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-4">
        {baseBg}
        <motion.div className="relative z-10 flex w-full max-w-3xl flex-col gap-2 py-4">
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active } = getStepState(index);
            const isLast = index === normalizedSteps.length - 1;
            const canTap = isTapMode && active && !isComplete;
            return (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: revealed ? 1 : future ? 0.35 : 0.4,
                    scale: revealed ? 1 : 0.97,
                  }}
                  transition={{ delay: isTapMode ? 0 : index * 0.15 }}
                  role={canTap ? 'button' : undefined}
                  tabIndex={canTap ? 0 : undefined}
                  onClick={() => handleStepActivate(index)}
                  onKeyDown={(e) => {
                    if (canTap && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleAdvance();
                    }
                  }}
                  aria-label={canTap ? 'Toque para revelar o próximo passo' : undefined}
                  className={`relative flex min-h-11 min-w-0 items-start gap-3 ${SLIDE_CARD} border-2 px-3 py-2.5 ${theme.borderColor} ${
                    canTap ? 'cursor-pointer hover:border-green-300' : ''
                  } ${active ? 'ring-2 ring-green-300/50' : ''}`}
                >
                  <LogicFlowTapBadge
                    visible={canTap && index < normalizedSteps.length - 1}
                  />
                  <span className="btn-editorial-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-0 text-sm font-bold text-[#1a2e05]">
                    {revealed ? <CheckCircle2 size={18} /> : index + 1}
                  </span>
                  <p
                    className={`font-body min-w-0 text-base font-semibold leading-snug break-words [overflow-wrap:anywhere] ${
                      revealed ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {renderStepText(step, revealed, future, isTapMode, theme)}
                  </p>
                </motion.div>
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: revealed ? 1 : 0.3 }}
                    transition={{ delay: isTapMode ? 0 : index * 0.15 + 0.3 }}
                    className="flex justify-center"
                  >
                    <ArrowDown className="h-4 w-4" style={{ color: theme.glow }} />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
          {footer}
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE: CARDS
  if (variant === 'cards') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-4">
        {baseBg}
        <motion.div className={`relative z-10 ${logicFlowCardsGridClass(normalizedSteps.length, normalizedSteps)}`}>
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active } = getStepState(index);
            const isActiveHighlight =
              !isTapMode && revealedSteps[revealedSteps.length - 1] === index;
            const canTap = isTapMode && active && !isComplete;
            const visual = getLogicFlowStepVisual(revealed, isTapMode, active, isActiveHighlight);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: visual.isFuture ? 0.45 : 1,
                  y: revealed ? 0 : 10,
                }}
                transition={{ delay: isTapMode ? 0 : index * 0.2 }}
                role={canTap ? 'button' : undefined}
                tabIndex={canTap ? 0 : undefined}
                onClick={() => handleStepActivate(index)}
                onKeyDown={(e) => {
                  if (canTap && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleAdvance();
                  }
                }}
                aria-label={canTap ? 'Toque para revelar o próximo passo' : undefined}
                className={logicFlowStepCardClass(visual, theme, canTap)}
              >
                <LogicFlowTapBadge
                  visible={canTap && index < normalizedSteps.length - 1}
                />
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Passo {index + 1}
                </span>
                <motion.div className={logicFlowStepIconClass(visual)}>
                  {revealed ? <CheckCircle2 size={20} /> : index + 1}
                </motion.div>
                <p
                  className={`mt-3 font-body text-base font-semibold leading-relaxed ${
                    visual.isCurrent
                      ? 'text-slate-900'
                      : visual.isPast
                        ? 'text-slate-600'
                        : 'text-slate-400'
                  }`}
                >
                  {renderStepText(step, revealed, future, isTapMode, theme)}
                </p>
              </motion.div>
            );
          })}
          <motion.div className="col-span-full">{footer}</motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE PADRÃO: VERTICAL
  return (
    <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start p-4 md:p-6 lg:p-8">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />

      <motion.div className="relative z-10 w-full max-w-3xl py-3 pb-4 md:py-6 md:pb-6">
        <motion.div className="relative space-y-0 pl-7 md:pl-8">
          <div
            className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-gradient-to-b from-blue-600 via-blue-400 to-blue-200"
            aria-hidden
          />
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active } = getStepState(index);
            const isLast = index === normalizedSteps.length - 1;
            const isActiveHighlight =
              !isTapMode && revealedSteps[revealedSteps.length - 1] === index;
            const canTap = isTapMode && active && !isComplete;
            const visual = getLogicFlowStepVisual(revealed, isTapMode, active, isActiveHighlight);

            return (
              <motion.div key={index} className="relative mb-1">
                <LogicFlowTimelineDot revealed={revealed} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{
                    opacity: visual.isFuture ? 0.4 : 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: isTapMode ? 0.35 : 0.45,
                    delay: isTapMode ? 0 : index * 0.1,
                    type: 'spring',
                    stiffness: 220,
                    damping: 22,
                  }}
                >
                  <motion.div
                    role={canTap ? 'button' : undefined}
                    tabIndex={canTap ? 0 : undefined}
                    aria-label={canTap ? 'Toque para revelar o próximo passo' : undefined}
                    onClick={() => handleStepActivate(index)}
                    onKeyDown={(e) => {
                      if (canTap && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleAdvance();
                      }
                    }}
                    className={logicFlowStepCardClass(visual, theme, canTap)}
                  >
                    <LogicFlowTapBadge
                      visible={canTap && index < normalizedSteps.length - 1}
                    />
                    {visual.isCurrent ? (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        aria-hidden
                        style={{
                          background: `radial-gradient(ellipse 90% 80% at 50% 0%, ${theme.glow} 0%, transparent 65%)`,
                        }}
                      />
                    ) : null}
                    <motion.div className="relative flex min-w-0 items-start gap-3">
                      <motion.div
                        className={logicFlowStepIconClass(visual)}
                        animate={{ scale: revealed ? 1 : 0.92 }}
                        transition={{ delay: isTapMode ? 0 : index * 0.1 + 0.15 }}
                      >
                        {revealed ? (
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                        ) : (
                          <span className="font-mono text-sm font-bold tabular-nums">{index + 1}</span>
                        )}
                      </motion.div>

                      <motion.div className="min-w-0 flex-1 pt-0.5">
                        <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Passo {index + 1}
                        </span>
                        <p
                          className={`font-body text-base leading-relaxed break-words [overflow-wrap:anywhere] transition-colors duration-300 ${
                            visual.isCurrent
                              ? 'font-bold text-slate-900'
                              : visual.isPast
                                ? 'font-medium text-slate-600'
                                : 'font-medium text-slate-400'
                          }`}
                        >
                          {renderStepText(step, revealed, future, isTapMode, theme)}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {!isLast ? (
                    <div className="flex justify-center">
                      <LogicFlowConnector active={revealed} />
                    </div>
                  ) : null}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {footer}
      </motion.div>
    </motion.div>
  );
};
