'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowTrabalhoVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Juggle V/F com acento amber — enfermagem do trabalho / NR-32. */
export function LogicFlowTrabalhoVfJuggleTap(props: LogicFlowTrabalhoVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="trabalho" />;
}
