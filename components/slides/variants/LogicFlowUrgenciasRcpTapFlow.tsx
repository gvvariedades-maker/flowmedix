'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';

interface LogicFlowUrgenciasRcpTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho tap-flow SBV adulto — orçamento ≤3 taps (Onda 4). */
export function LogicFlowUrgenciasRcpTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasRcpTapFlowProps) {
  const budgeted = useMemo(
    () => applyProtocolTapBudget(normalizeLogicFlowSteps(steps)),
    [steps],
  );
  return (
    <LogicFlowStepLadder steps={budgeted} theme={theme} revealMode={revealMode} accent="urgencias" />
  );
}
