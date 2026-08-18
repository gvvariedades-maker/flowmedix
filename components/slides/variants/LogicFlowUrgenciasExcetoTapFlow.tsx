'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicIsolateShell } from '../logicFlowShells';

interface LogicFlowUrgenciasExcetoTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** EXCETO urgências — isolate board (0 taps). */
export function LogicFlowUrgenciasExcetoTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowUrgenciasExcetoTapFlowProps) {
  return (
    <LogicIsolateShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      eyebrow="EXCETO · Urgências"
      title="Isolar a conduta inadequada"
    />
  );
}
