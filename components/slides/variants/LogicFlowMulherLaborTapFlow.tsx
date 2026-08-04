'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseMulherPartoStep } from '@/lib/slides/mulherPartoSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowMulherLaborTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Parto — FocusShell + letter rail (P1 lote 2). */
export function LogicFlowMulherLaborTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowMulherLaborTapFlowProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step, index) => parseMulherPartoStep(step, index));
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Trilho do parto"
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
