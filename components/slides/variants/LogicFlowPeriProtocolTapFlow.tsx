'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';

interface LogicFlowPeriProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Protocolo perioperatório — LogicRailShell + orçamento ≤3 taps. */
export function LogicFlowPeriProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowPeriProtocolTapFlowProps) {
  return (
    <LogicRailShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Protocolo perioperatório"
    />
  );
}
