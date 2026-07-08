'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowUrgenciasShockTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

export function LogicFlowUrgenciasShockTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowUrgenciasShockTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="shock" />;
}
