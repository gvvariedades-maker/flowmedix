'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowUrgenciasRcpTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho tap-flow SBV adulto — elos rose com revelação passo a passo. */
export function LogicFlowUrgenciasRcpTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasRcpTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="urgencias" />;
}
