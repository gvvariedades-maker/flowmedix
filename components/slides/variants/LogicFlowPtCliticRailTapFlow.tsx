'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  buildPtCliticPositionBoard,
  extractStepLetter,
  inferStepRole,
} from '@/lib/slides/ptCliticRailSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
} from '../logicFlowShells';
import { LogicFlowPtCliticPositionBoard } from './LogicFlowPtCliticPositionBoard';

interface LogicFlowPtCliticRailTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Clítico trilho — board de posição quando fecha; senão Focus + letter rail (P1 lote 5).
 */
export function LogicFlowPtCliticRailTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowPtCliticRailTapFlowProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const positionBoardModel = useMemo(
    () => buildPtCliticPositionBoard(normalized),
    [normalized],
  );
  const letterSteps = useMemo(
    () => letterStepsFromPtRoles(normalized, inferStepRole, extractStepLetter),
    [normalized],
  );

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  if (positionBoardModel) {
    return (
      <LogicFlowPtCliticPositionBoard
        model={positionBoardModel}
        theme={theme}
        footerRule={footerRule}
      />
    );
  }

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Trilho do clítico"
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
