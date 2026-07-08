'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowUrgenciasExcetoTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

export function LogicFlowUrgenciasExcetoTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasExcetoTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="urgencias" />;
}
