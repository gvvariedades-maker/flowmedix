'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowWoundPrepTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Preparo de ferida — FocusShell (Fase B). */
export function LogicFlowWoundPrepTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowWoundPrepTapFlowProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Preparo · ferida"
      applyTapBudget
    />
  );
}
