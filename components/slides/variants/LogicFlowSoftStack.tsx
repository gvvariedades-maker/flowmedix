'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell } from '../logicFlowShells';

interface LogicFlowSoftStackProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/**
 * Legado `iv-care-soft-stack` — pilha pastel substituída por FocusShell (P1 lote 6).
 * ID de layout_variant intacto; sem deck Instagram / emoji / undo.
 */
export function LogicFlowSoftStack({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowSoftStackProps) {
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Acesso venoso · decisão"
      applyTapBudget
    />
  );
}
