'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicRailShell } from '../logicFlowShells';

interface LogicFlowSpProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Trilho NSP — RailShell. */
export function LogicFlowSpProtocolTapFlow({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowSpProtocolTapFlowProps) {
  return (
    <LogicRailShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="seguranca"
      eyebrow="Protocolo · NSP"
    />
  );
}
