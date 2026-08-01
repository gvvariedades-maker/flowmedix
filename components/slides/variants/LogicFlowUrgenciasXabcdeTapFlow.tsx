'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';

interface LogicFlowUrgenciasXabcdeTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho tap-flow XABCDE — orçamento ≤3 taps (Onda 4). */
export function LogicFlowUrgenciasXabcdeTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasXabcdeTapFlowProps) {
  const budgeted = useMemo(
    () => applyProtocolTapBudget(normalizeLogicFlowSteps(steps)),
    [steps],
  );
  return <LogicFlowStepLadder steps={budgeted} theme={theme} revealMode={revealMode} accent="xabcde" />;
}
