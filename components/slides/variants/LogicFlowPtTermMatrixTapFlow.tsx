'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractTermStepLetter,
  inferTermStepRole,
} from '@/lib/slides/ptTermMatrixSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
} from '../logicFlowShells';
import { CategoryStrip } from '../primitives';

interface LogicFlowPtTermMatrixTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** Termos (matriz T1→T2) — FocusShell + letter rail + chip de célula (P1 lote 5). */
export function LogicFlowPtTermMatrixTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowPtTermMatrixTapFlowProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const letterSteps = useMemo(
    () => letterStepsFromPtRoles(normalized, inferTermStepRole, extractTermStepLetter),
    [normalized],
  );
  const roles = useMemo(
    () => normalized.map((step) => inferTermStepRole(step)),
    [normalized],
  );

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Matriz de termos"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          letterSteps,
          activeStepIndex,
          isComplete,
        );
        const role = roles[Math.min(activeStepIndex, Math.max(roles.length - 1, 0))];
        const cellChip =
          role === 'classificar_termo'
            ? /^t1\b/i.test(normalized[activeStepIndex]?.trim() ?? '')
              ? 'T1'
              : /^t2\b/i.test(normalized[activeStepIndex]?.trim() ?? '')
                ? 'T2'
                : 'Célula'
            : null;
        return (
          <div className="flex flex-col items-center gap-2">
            {cellChip ? <CategoryStrip label={cellChip} tone="teal" /> : null}
            <LetterEliminationRail
              eliminated={eliminated}
              winnerLetter={winnerLetter}
              isComplete={isComplete}
            />
          </div>
        );
      }}
    />
  );
}
