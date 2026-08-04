'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowBurnTriageTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Triagem de queimadura — FocusShell (Fase B). */
export function LogicFlowBurnTriageTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowBurnTriageTapFlowProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Triage · queimadura"
      applyTapBudget
    />
  );
}
