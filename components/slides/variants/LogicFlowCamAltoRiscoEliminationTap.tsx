'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { LogicFlowStepLadder } from './LogicFlowStepLadder';

interface LogicFlowCamAltoRiscoEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
}

/** Eliminação MCQ alto risco — escada tap amber (insulina, heparina, dupla checagem). */
export function LogicFlowCamAltoRiscoEliminationTap({
  steps,
  theme,
  revealMode = 'tap',
}: LogicFlowCamAltoRiscoEliminationTapProps) {
  return <LogicFlowStepLadder steps={steps} theme={theme} revealMode={revealMode} accent="cam" />;
}
