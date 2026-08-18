'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseMulherPrenatalStep } from '@/lib/slides/mulherPrenatalSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowMulherPrenatalTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Pré-natal — FocusShell + letter rail (P1 lote 2). */
export function LogicFlowMulherPrenatalTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowMulherPrenatalTapFlowProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step, index) => parseMulherPrenatalStep(step, index));
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Trilho gestacional"
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
