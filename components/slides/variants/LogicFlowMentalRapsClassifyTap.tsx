'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowMentalRapsClassifyTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** RAPS — classificar nó da rede — FocusShell (funil + ≤3 taps). */
export function LogicFlowMentalRapsClassifyTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowMentalRapsClassifyTapProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="RAPS · classificar"
      applyTapBudget
    />
  );
}
