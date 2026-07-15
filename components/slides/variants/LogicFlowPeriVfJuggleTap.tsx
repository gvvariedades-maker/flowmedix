'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowPeriVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Juggle V/F com acento violet — assistência perioperatória / SRPA. */
export function LogicFlowPeriVfJuggleTap(props: LogicFlowPeriVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="peri" />;
}
