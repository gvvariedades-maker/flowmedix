'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowSegurancaVfJuggleTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Juggle V/F com acento amber — Segurança do Paciente / NSP. */
export function LogicFlowSegurancaVfJuggleTap(props: LogicFlowSegurancaVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="seguranca" />;
}
