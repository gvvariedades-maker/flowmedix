'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicIsolateShell } from '../logicFlowShells';

interface LogicFlowAdolescentExcetoIsolateTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/**
 * EXCETO Adolescente — LogicIsolateShell (0 taps).
 * Board bespoke permanece em LogicFlowAdolescentExcetoIsolateBoard.
 */
export function LogicFlowAdolescentExcetoIsolateTap({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentExcetoIsolateTapProps) {
  return (
    <LogicIsolateShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      eyebrow="EXCETO · Saúde do Adolescente"
      title="Isolar a conduta inadequada"
    />
  );
}
