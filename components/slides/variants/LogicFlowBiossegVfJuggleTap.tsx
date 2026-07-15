import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowPniVfJuggleTap } from './LogicFlowPniVfJuggleTap';

interface LogicFlowBiossegVfJuggleTapProps {
  steps: string[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
}

export function LogicFlowBiossegVfJuggleTap(props: LogicFlowBiossegVfJuggleTapProps) {
  return <LogicFlowPniVfJuggleTap {...props} accentVariant="biosseg" />;
}
