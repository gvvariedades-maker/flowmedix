'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowMentalCrisisDecisionTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Crise em saúde mental — FocusShell (funil + ≤3 taps). */
export function LogicFlowMentalCrisisDecisionTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowMentalCrisisDecisionTapProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Crise · priorizar"
      applyTapBudget
    />
  );
}
