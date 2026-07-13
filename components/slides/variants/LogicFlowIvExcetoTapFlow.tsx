'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

export function LogicFlowIvExcetoTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="default" />;
}
