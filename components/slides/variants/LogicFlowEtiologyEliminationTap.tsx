'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowEtiologyEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Eliminação etiológica — FocusShell (funil + ≤3 taps). */
export function LogicFlowEtiologyEliminationTap({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowEtiologyEliminationTapProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Etiologia · eliminar"
      applyTapBudget
    />
  );
}
