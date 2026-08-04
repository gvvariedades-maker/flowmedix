'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowPeriSrpaDecisionTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** SRPA — FocusShell (funil + ≤3 taps). */
export function LogicFlowPeriSrpaDecisionTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowPeriSrpaDecisionTapProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="SRPA · decisão"
      applyTapBudget
    />
  );
}
