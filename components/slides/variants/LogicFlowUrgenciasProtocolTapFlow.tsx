'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';

interface LogicFlowUrgenciasProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

export function LogicFlowUrgenciasProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowUrgenciasProtocolTapFlowProps) {
  return (
    <LogicRailShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="urgencias"
      eyebrow="Protocolo · urgências"
    />
  );
}
