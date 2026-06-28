'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowRespiratorioVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Juggle V/F com acento cyan — asma/DPOC crônica. */
export function LogicFlowRespiratorioVfJuggleTap(props: LogicFlowRespiratorioVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="respiratorio" />;
}
