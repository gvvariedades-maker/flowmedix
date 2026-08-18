'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicIsolateShell } from '../logicFlowShells';

interface LogicFlowIvExcetoTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** EXCETO punção/IV — isolate board (0 taps). */
export function LogicFlowIvExcetoTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowIvExcetoTapFlowProps) {
  return (
    <LogicIsolateShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      eyebrow="EXCETO · Punção / cateter"
      title="Isolar a conduta inadequada"
    />
  );
}
