'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { applyProtocolTapBudget } from '@/lib/slides/protocolTapBudget';

interface LogicFlowFarmacoProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Tap-flow farmaco/protocolo — orçamento ≤3 taps; tokens via ladder stroke (Onda 4). */
export function LogicFlowFarmacoProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowFarmacoProtocolTapFlowProps) {
  const budgeted = useMemo(
    () => applyProtocolTapBudget(normalizeLogicFlowSteps(steps)),
    [steps],
  );
  return <LogicFlowStepLadder steps={budgeted} theme={theme} revealMode={revealMode} accent="stroke" />;
}
