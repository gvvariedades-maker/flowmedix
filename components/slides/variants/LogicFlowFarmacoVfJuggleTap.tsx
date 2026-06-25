'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowFarmacoVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Juggle V/F com acento violet — farmacodinâmica e farmacocinética. */
export function LogicFlowFarmacoVfJuggleTap(props: LogicFlowFarmacoVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="farmaco" />;
}
