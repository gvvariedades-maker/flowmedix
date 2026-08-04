'use client';

/**
 * Compat — wrappers *-tap-flow continuam importando LogicFlowStepLadder.
 * Miolo = LogicFocusShell (convergência Fase B). IDs de layout_variant intactos.
 */

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFocusShell, type LogicFlowShellAccent } from '../logicFlowShells';

interface LogicFlowStepLadderProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  accent?:
    | 'default'
    | 'sonda'
    | 'urgencias'
    | 'xabcde'
    | 'stroke'
    | 'shock'
    | 'choking'
    | 'pediatric'
    | 'cam'
    | 'seguranca';
}

export function LogicFlowStepLadder({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
  accent = 'default',
}: LogicFlowStepLadderProps) {
  const shellAccent: LogicFlowShellAccent = accent;
  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent={shellAccent}
      eyebrow={accent === 'sonda' ? 'Checklist de procedimento' : undefined}
    />
  );
}
