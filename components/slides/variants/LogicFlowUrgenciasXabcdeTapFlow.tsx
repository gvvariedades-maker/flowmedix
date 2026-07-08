'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowUrgenciasXabcdeTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho tap-flow XABCDE — eliminação de alternativas trauma pré-hospitalar. */
export function LogicFlowUrgenciasXabcdeTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasXabcdeTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="xabcde" />;
}
