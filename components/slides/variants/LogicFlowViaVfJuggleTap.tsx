'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowViaVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
}

/** Juggle V/F com acento emerald — vias de administração. */
export function LogicFlowViaVfJuggleTap(props: LogicFlowViaVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="via" />;
}
