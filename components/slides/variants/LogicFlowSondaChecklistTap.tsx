'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowSondaChecklistTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
}

/** Checklist de procedimento — escada tap com acento indigo (sondagem). */
export function LogicFlowSondaChecklistTap(props: LogicFlowSondaChecklistTapProps) {
  return <LogicFlowStepLadder {...props} accent="sonda" />;
}
