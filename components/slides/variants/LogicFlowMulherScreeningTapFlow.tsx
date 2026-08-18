'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseMulherScreeningStep } from '@/lib/slides/mulherPapanicolauSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowMulherScreeningTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Rastreamento (Papanicolau) — FocusShell + letter rail (P1 lote 2). */
export function LogicFlowMulherScreeningTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowMulherScreeningTapFlowProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step, index) => parseMulherScreeningStep(step, index));
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Rastreamento · colo"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          parsed,
          activeStepIndex,
          isComplete,
        );
        return (
          <LetterEliminationRail
            eliminated={eliminated}
            winnerLetter={winnerLetter}
            isComplete={isComplete}
          />
        );
      }}
    />
  );
}
