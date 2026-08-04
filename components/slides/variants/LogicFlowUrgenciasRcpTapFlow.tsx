'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';

interface LogicFlowUrgenciasRcpTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho SBV adulto — RailShell + ≤3 taps. */
export function LogicFlowUrgenciasRcpTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowUrgenciasRcpTapFlowProps) {
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
      accent="urgencias"
      eyebrow="SBV · compressões"
      applyTapBudget={false}
    />
  );
}
