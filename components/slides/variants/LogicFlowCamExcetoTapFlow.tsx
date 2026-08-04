'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicIsolateShell } from '../logicFlowShells';

interface LogicFlowCamExcetoTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** EXCETO cuidados na admin — isolate board (0 taps). */
export function LogicFlowCamExcetoTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowCamExcetoTapFlowProps) {
  return (
    <LogicIsolateShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      eyebrow="EXCETO · Cuidados na admin"
      title="Isolar a conduta inadequada"
    />
  );
}
