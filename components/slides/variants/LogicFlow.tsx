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
import { LogicFlowStepLadder } from './LogicFlowStepLadder';
import { LogicFlowSoftStack } from './LogicFlowSoftStack';
import { LogicFlowLabVfSoftStack } from './LogicFlowLabVfSoftStack';
import { LogicFlowWoundPrepTapFlow } from './LogicFlowWoundPrepTapFlow';
import { LogicFlowBurnTriageTapFlow } from './LogicFlowBurnTriageTapFlow';
import { LogicFlowTrabalhoVfJuggleTap } from './LogicFlowTrabalhoVfJuggleTap';
import { LogicFlowRespiratorioVfJuggleTap } from './LogicFlowRespiratorioVfJuggleTap';
import { LogicFlowUrgenciasRcpTapFlow } from './LogicFlowUrgenciasRcpTapFlow';
import { LogicFlowUrgenciasXabcdeTapFlow } from './LogicFlowUrgenciasXabcdeTapFlow';
import { LogicFlowUrgenciasStrokeEliminationTap } from './LogicFlowUrgenciasStrokeEliminationTap';
import { LogicFlowUrgenciasShockTapFlow } from './LogicFlowUrgenciasShockTapFlow';
import { LogicFlowUrgenciasChokingTapFlow } from './LogicFlowUrgenciasChokingTapFlow';
import { LogicFlowUrgenciasPediatricTapFlow } from './LogicFlowUrgenciasPediatricTapFlow';
import { LogicFlowUrgenciasProtocolTapFlow } from './LogicFlowUrgenciasProtocolTapFlow';
import { LogicFlowUrgenciasExcetoTapFlow } from './LogicFlowUrgenciasExcetoTapFlow';
import { LogicFlowEtiologyEliminationTap } from './LogicFlowEtiologyEliminationTap';
import { LogicFlowItuExcetoTap } from './LogicFlowItuExcetoTap';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';
import { LogicFlowCamVfJuggleTap } from './LogicFlowCamVfJuggleTap';
import { LogicFlowCamAltoRiscoEliminationTap } from './LogicFlowCamAltoRiscoEliminationTap';
import { LogicFlowCamExcetoTapFlow } from './LogicFlowCamExcetoTapFlow';
import { LogicFlowCamDocumentacaoVfTap } from './LogicFlowCamDocumentacaoVfTap';
import { LogicFlowIvComplicationTapFlow } from './LogicFlowIvComplicationTapFlow';
import { LogicFlowIvDeviceTapFlow } from './LogicFlowIvDeviceTapFlow';
import { LogicFlowIvExcetoTapFlow } from './LogicFlowIvExcetoTapFlow';
import { LogicFlowIvIntervalTapFlow } from './LogicFlowIvIntervalTapFlow';
import { LogicFlowIvPunctureTapFlow } from './LogicFlowIvPunctureTapFlow';
import { LogicFlowIvBundleTapFlow } from './LogicFlowIvBundleTapFlow';
import { LogicFlowPniCalendarEliminationTap } from './LogicFlowPniCalendarEliminationTap';
import { LogicFlowPniColdChainTap } from './LogicFlowPniColdChainTap';
import { LogicFlowVitalsTranslateTap } from './LogicFlowVitalsTranslateTap';
import { LogicFlowSondaChecklistTap } from './LogicFlowSondaChecklistTap';
import { LogicFlowViaVfJuggleTap } from './LogicFlowViaVfJuggleTap';
import { LogicFlowFarmacoVfJuggleTap } from './LogicFlowFarmacoVfJuggleTap';
import { LogicFlowAdolescentVfWeaveTap } from './LogicFlowAdolescentVfWeaveTap';
import { LogicFlowAdolescentZClassifyTap } from './LogicFlowAdolescentZClassifyTap';
import { LogicFlowMulherPrenatalTapFlow } from './LogicFlowMulherPrenatalTapFlow';
import { LogicFlowMulherLaborTapFlow } from './LogicFlowMulherLaborTapFlow';
import { LogicFlowMulherScreeningTapFlow } from './LogicFlowMulherScreeningTapFlow';
import { LogicFlowMulherMamaTapFlow } from './LogicFlowMulherMamaTapFlow';
import { LogicFlowMulherPuerperioTapFlow } from './LogicFlowMulherPuerperioTapFlow';
import { LogicFlowMulherPlanejamentoTapFlow } from './LogicFlowMulherPlanejamentoTapFlow';
import { SLIDE_CARD } from '../core/slideSurface';
import {
  getLogicFlowStepVisual,
  logicFlowCardsGridClass,
  logicFlowStepCardClass,
  logicFlowStepIconClass,
} from '../core/logicFlowStepStyles';

interface LogicFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  layoutVariant?: string;
  /** Default `auto` preserva slides legados; premium usa `reveal_mode: "tap"` no JSON. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  /** Override do chip interno (ex.: INSULINA · VIAS no molde via-vf-juggle-tap). */
  chipLabel?: string;
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

  if (variant === 'oxygen-step-ladder') {
    return (
      <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} />
    );
  }

  if (variant === 'iv-care-soft-stack') {
    return <LogicFlowSoftStack steps={steps} theme={theme} />;
  }

  if (variant === 'lab-vf-soft-stack') {
    return <LogicFlowLabVfSoftStack steps={steps} theme={theme} />;
  }

  if (variant === 'wound-prep-tap-flow') {
    return <LogicFlowWoundPrepTapFlow steps={steps} theme={theme} />;
  }

  if (variant === 'burn-triage-tap-flow') {
    return <LogicFlowBurnTriageTapFlow steps={steps} theme={theme} />;
  }

  if (variant === 'trabalho-vf-juggle-tap') {
    return <LogicFlowTrabalhoVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'respiratorio-vf-juggle-tap') {
    return <LogicFlowRespiratorioVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'urgencias-rcp-tap-flow') {
    return (
      <LogicFlowUrgenciasRcpTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-xabcde-tap-flow') {
    return (
      <LogicFlowUrgenciasXabcdeTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-stroke-elimination-tap') {
    return (
      <LogicFlowUrgenciasStrokeEliminationTap
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-shock-tap-flow') {
    return (
      <LogicFlowUrgenciasShockTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-choking-tap-flow') {
    return (
      <LogicFlowUrgenciasChokingTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-pediatric-tap-flow') {
    return (
      <LogicFlowUrgenciasPediatricTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-protocol-tap-flow') {
    return (
      <LogicFlowUrgenciasProtocolTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'urgencias-exceto-tap-flow') {
    return (
      <LogicFlowUrgenciasExcetoTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'etiology-elimination-tap') {
    return <LogicFlowEtiologyEliminationTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'itu-exceto-tap') {
    return <LogicFlowItuExcetoTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'pni-vf-juggle-tap') {
    return <LogicFlowPniVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'cam-vf-juggle-tap') {
    return <LogicFlowCamVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'cam-alto-risco-elimination-tap') {
    return (
      <LogicFlowCamAltoRiscoEliminationTap steps={steps} theme={theme} revealMode={revealMode} />
    );
  }

  if (variant === 'cam-exceto-tap-flow') {
    return (
      <LogicFlowCamExcetoTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'cam-documentacao-vf-tap') {
    return <LogicFlowCamDocumentacaoVfTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'iv-complication-tap-flow') {
    return (
      <LogicFlowIvComplicationTapFlow
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'iv-device-tap-flow') {
    return (
      <LogicFlowIvDeviceTapFlow steps={steps} theme={theme} revealMode={revealMode} footerRule={footerRule} />
    );
  }

  if (variant === 'iv-exceto-tap-flow') {
    return (
      <LogicFlowIvExcetoTapFlow steps={steps} theme={theme} revealMode={revealMode} footerRule={footerRule} />
    );
  }

  if (variant === 'iv-interval-tap-flow') {
    return (
      <LogicFlowIvIntervalTapFlow steps={steps} theme={theme} revealMode={revealMode} footerRule={footerRule} />
    );
  }

  if (variant === 'iv-puncture-tap-flow') {
    return (
      <LogicFlowIvPunctureTapFlow steps={steps} theme={theme} revealMode={revealMode} footerRule={footerRule} />
    );
  }

  if (variant === 'iv-bundle-tap-flow') {
    return (
      <LogicFlowIvBundleTapFlow steps={steps} theme={theme} revealMode={revealMode} footerRule={footerRule} />
    );
  }

  if (variant === 'pni-calendar-elimination-tap') {
    return (
      <LogicFlowPniCalendarEliminationTap steps={steps} theme={theme} footerRule={footerRule} />
    );
  }

  if (variant === 'mulher-prenatal-tap-flow') {
    return <LogicFlowMulherPrenatalTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'mulher-labor-tap-flow') {
    return <LogicFlowMulherLaborTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'mulher-screening-tap-flow') {
    return <LogicFlowMulherScreeningTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'mulher-mama-tap-flow') {
    return <LogicFlowMulherMamaTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'mulher-puerperio-tap-flow') {
    return <LogicFlowMulherPuerperioTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'mulher-planejamento-tap-flow') {
    return <LogicFlowMulherPlanejamentoTapFlow steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'pni-cold-chain-tap') {
    return <LogicFlowPniColdChainTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'ist-vf-juggle-tap') {
    return (
      <LogicFlowPniVfJuggleTap
        steps={steps}
        theme={theme}
        footerRule={footerRule}
        accentVariant="ist"
      />
    );
  }

  if (variant === 'via-vf-juggle-tap') {
    return (
      <LogicFlowViaVfJuggleTap
        steps={steps}
        theme={theme}
        footerRule={footerRule}
        chipLabel={chipLabel}
      />
    );
  }

  if (variant === 'farmaco-vf-juggle-tap') {
    return <LogicFlowFarmacoVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'adolescent-vf-weave-tap') {
    return <LogicFlowAdolescentVfWeaveTap steps={steps} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'adolescent-z-classify-tap') {
    return (
      <LogicFlowAdolescentZClassifyTap
        steps={steps}
        theme={theme}
        revealMode={revealMode}
        footerRule={footerRule}
      />
    );
  }

  if (variant === 'dose-calc-tap' || variant === 'sae-decision-tap') {
    return (
      <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} />
    );
  }

  if (variant === 'sonda-decision-tap') {
    return (
      <LogicFlowSondaChecklistTap steps={steps} theme={theme} revealMode={revealMode} />
    );
  }

  if (variant === 'vitals-translate-tap') {
    return <LogicFlowVitalsTranslateTap steps={steps} theme={theme} />;
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
