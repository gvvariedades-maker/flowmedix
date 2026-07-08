'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowUrgenciasPediatricTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

export function LogicFlowUrgenciasPediatricTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasPediatricTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="pediatric" />;
}
