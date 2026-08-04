'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseMulherPuerperioStep } from '@/lib/slides/mulherPuerperioSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowMulherPuerperioTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Puerpério — FocusShell + letter rail (P1 lote 2). */
export function LogicFlowMulherPuerperioTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowMulherPuerperioTapFlowProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step, index) => parseMulherPuerperioStep(step, index));
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Trilho puerpério"
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
