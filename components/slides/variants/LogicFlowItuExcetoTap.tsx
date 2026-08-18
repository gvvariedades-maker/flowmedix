'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicIsolateShell } from '../logicFlowShells';

interface LogicFlowItuExcetoTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** EXCETO ITU / sistema fechado — isolate board (0 taps). */
export function LogicFlowItuExcetoTap({
  steps,
  theme,
  footerRule,
}: LogicFlowItuExcetoTapProps) {
  return (
    <LogicIsolateShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      eyebrow="EXCETO · ITU / sistema fechado"
      title="Isolar a conduta inadequada"
    />
  );
}
