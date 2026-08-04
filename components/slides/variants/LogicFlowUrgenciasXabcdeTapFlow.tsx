'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';

interface LogicFlowUrgenciasXabcdeTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho XABCDE — LogicRailShell + orçamento ≤3 taps. */
export function LogicFlowUrgenciasXabcdeTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowUrgenciasXabcdeTapFlowProps) {
  return (
    <LogicRailShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="xabcde"
      eyebrow="Trilho XABCDE"
    />
  );
}
