'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractCommaStepLetter,
  inferCommaStepRole,
} from '@/lib/slides/ptCommaRailSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
} from '../logicFlowShells';

interface LogicFlowPtCommaRailTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Vírgula — FocusShell + letter rail (P1 lote 5). */
export function LogicFlowPtCommaRailTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowPtCommaRailTapFlowProps) {
  const letterSteps = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return letterStepsFromPtRoles(normalized, inferCommaStepRole, extractCommaStepLetter);
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Trilho da vírgula"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          letterSteps,
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
