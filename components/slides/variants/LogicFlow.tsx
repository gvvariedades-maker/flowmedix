'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle2, Circle, Hand } from 'lucide-react';
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

interface LogicFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  layoutVariant?: string;
  /** Default `auto` preserva slides legados; premium usa `reveal_mode: "tap"` no JSON. */
  revealMode?: LogicFlowRevealMode;
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

function LogicFlowTapBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute -top-2 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white"
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

  if (!normalizedSteps || normalizedSteps.length === 0) {
    return (
      <motion.div className="flex min-h-full w-full min-w-0 items-center justify-center p-6">
        <p className="font-body text-base text-slate-400">Nenhum passo definido</p>
      </motion.div>
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
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        }}
      />
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
                  className={`relative flex min-h-11 min-w-0 items-start gap-3 rounded-xl border-2 ${theme.borderColor} bg-slate-900/92 px-3 py-2.5 ${
                    canTap ? 'cursor-pointer hover:border-violet-400/40' : ''
                  } ${active ? 'ring-2 ring-violet-400/40' : ''}`}
                  style={{ borderColor: revealed ? theme.glow : 'rgba(255,255,255,0.08)' }}
                >
                  <LogicFlowTapBadge
                    visible={canTap && index < normalizedSteps.length - 1}
                  />
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-mono tabular-nums ${theme.primary} text-sm font-bold text-slate-900`}
                  >
                    {revealed ? <CheckCircle2 size={18} /> : index + 1}
                  </span>
                  <p
                    className={`font-body min-w-0 text-base font-semibold leading-snug break-words [overflow-wrap:anywhere] ${
                      revealed ? 'text-slate-50' : 'text-slate-500/70'
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
        <motion.div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active } = getStepState(index);
            const isActiveHighlight =
              !isTapMode && revealedSteps[revealedSteps.length - 1] === index;
            const canTap = isTapMode && active && !isComplete;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: revealed ? 1 : future ? 0.4 : 0.5,
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
                className={`relative min-h-11 rounded-2xl border-2 ${theme.borderColor} bg-slate-900/92 p-4 transition-all ${
                  canTap ? 'cursor-pointer hover:border-violet-400/40' : ''
                } ${isActiveHighlight || active ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-violet-400/40' : ''}`}
                style={{
                  borderColor: revealed ? theme.glow : 'rgba(255,255,255,0.08)',
                }}
              >
                <LogicFlowTapBadge
                  visible={canTap && index < normalizedSteps.length - 1}
                />
                <motion.div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-mono tabular-nums ${theme.primary} text-sm font-bold text-slate-900`}
                >
                  {revealed ? <CheckCircle2 size={20} /> : index + 1}
                </motion.div>
                <p
                  className={`font-body text-base font-semibold leading-relaxed ${
                    revealed ? 'text-slate-50' : 'text-slate-500/70'
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
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }}
      />

      <motion.div className="relative z-10 w-full max-w-3xl py-3 md:py-6">
        <motion.div className="relative">
          {normalizedSteps.map((step, index) => {
            const { revealed, future, active } = getStepState(index);
            const isLast = index === normalizedSteps.length - 1;
            const isActiveHighlight =
              !isTapMode && revealedSteps[revealedSteps.length - 1] === index;
            const canTap = isTapMode && active && !isComplete;

            return (
              <motion.div key={index} className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: revealed ? 1 : future ? 0.25 : 0.3,
                    scale: revealed ? 1 : 0.8,
                    y: revealed ? 0 : 20,
                  }}
                  transition={{
                    duration: isTapMode ? 0.35 : 0.5,
                    delay: isTapMode ? 0 : index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="relative"
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
                    className={`
                      relative min-h-11 rounded-2xl p-3 md:p-5 min-w-0
                      bg-slate-900/92
                      border-2 ${theme.borderColor}
                      transition-all duration-300
                      ${revealed ? 'opacity-100' : 'opacity-30'}
                      ${isActiveHighlight || active ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-violet-400/40' : ''}
                      ${canTap ? 'cursor-pointer hover:border-violet-400/40' : ''}
                    `}
                    style={{
                      borderColor: revealed ? theme.glow : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <LogicFlowTapBadge
                    visible={canTap && index < normalizedSteps.length - 1}
                  />
                    <motion.div className="flex min-w-0 items-start gap-3">
                      <motion.div
                        animate={{
                          scale: revealed ? 1 : 0.5,
                          rotate: revealed ? 0 : 180,
                        }}
                        transition={{ delay: isTapMode ? 0 : index * 0.1 + 0.2 }}
                        className={`
                          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                          md:h-12 md:w-12 font-bold text-base md:text-lg
                          bg-gradient-to-br ${theme.primary} text-slate-900 relative
                        `}
                      >
                        {revealed ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: isTapMode ? 0 : index * 0.1 + 0.4 }}
                          >
                            <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                          </motion.div>
                        ) : (
                          <Circle className="h-5 w-5 opacity-50 md:h-6 md:w-6" />
                        )}
                        {!revealed && (
                          <span className="absolute inset-0 flex items-center justify-center font-mono font-bold tabular-nums">
                            {index + 1}
                          </span>
                        )}
                      </motion.div>

                      <motion.div className="min-w-0 flex-1 pt-1">
                        <p
                          className={`
                            font-body text-base font-semibold leading-relaxed
                            break-words [overflow-wrap:anywhere]
                            transition-colors duration-300
                            ${revealed ? 'text-slate-50' : 'text-slate-500/60'}
                          `}
                        >
                          {renderStepText(step, revealed, future, isTapMode, theme)}
                        </p>
                      </motion.div>
                    </motion.div>

                    {revealed && !isTapMode && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        style={{
                          background: `radial-gradient(circle, ${theme.glow}18 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </motion.div>

                  {!isLast && (
                    <motion.div className="relative flex justify-center py-1.5">
                      <motion.div
                        className="h-8 w-0.5 bg-gradient-to-b from-slate-700/50 to-transparent"
                        style={{ opacity: revealed ? 0.3 : 0.1 }}
                      />
                      {revealed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 32, opacity: 1 }}
                          transition={{
                            delay: isTapMode ? 0 : index * 0.1 + 0.5,
                            duration: 0.4,
                          }}
                          className="absolute w-0.5"
                          style={{
                            background: `linear-gradient(to bottom, ${theme.glow}, transparent)`,
                          }}
                        />
                      )}
                      {revealed && (
                        <motion.div
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: isTapMode ? 0 : index * 0.1 + 0.7 }}
                          className="absolute top-1/2 -translate-y-1/2"
                        >
                          <ArrowDown className="h-5 w-5" style={{ color: theme.glow }} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
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
