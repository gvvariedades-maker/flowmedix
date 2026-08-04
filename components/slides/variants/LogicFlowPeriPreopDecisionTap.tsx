'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowPeriPreopDecisionTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Pré-operatório — FocusShell (funil + ≤3 taps). */
export function LogicFlowPeriPreopDecisionTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowPeriPreopDecisionTapProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Pré-operatório · decisão"
      applyTapBudget
    />
  );
}
