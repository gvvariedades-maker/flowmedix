'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowSpProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho tap-flow NSP — elos amber com revelação passo a passo (quedas / eventos). */
export function LogicFlowSpProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowSpProtocolTapFlowProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="seguranca" />;
}
