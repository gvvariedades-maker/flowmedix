'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowCamVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** V/F dos 9 Certos — accent teal; parser compartilhado com PNI (`parseCamVfStep`). */
export function LogicFlowCamVfJuggleTap({ steps, theme, footerRule }: LogicFlowCamVfJuggleTapProps) {
  return (
    <LogicFlowPniVfJuggleTap
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accentVariant="cam"
    />
  );
}
