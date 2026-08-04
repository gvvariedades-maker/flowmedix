'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';

interface LogicFlowFarmacoProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Protocolo farmaco — RailShell + ≤3 taps. */
export function LogicFlowFarmacoProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowFarmacoProtocolTapFlowProps) {
  const budgeted = useMemo(
    () => applyProtocolTapBudget(normalizeLogicFlowSteps(steps)),
    [steps],
  );
  return (
    <LogicRailShell
      steps={budgeted}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="stroke"
      eyebrow="Protocolo · farmaco"
      applyTapBudget={false}
    />
  );
}
