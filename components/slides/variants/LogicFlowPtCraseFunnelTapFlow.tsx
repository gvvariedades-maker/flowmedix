'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  buildPtCraseFunnelBoard,
  extractStepLetter,
  inferStepRole,
} from '@/lib/slides/ptCraseSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
  letterStepsFromPtRoles,
} from '../logicFlowShells';
import { LogicFlowPtCraseFunnelBoard } from './LogicFlowPtCraseFunnelBoard';

interface LogicFlowPtCraseFunnelTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Crase funil — board glanceable quando o corpus fecha; senão Focus + letter rail (P1 lote 5).
 */
export function LogicFlowPtCraseFunnelTapFlow({
  steps,
  theme,
  footerRule,
}: LogicFlowPtCraseFunnelTapFlowProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const funnelBoardModel = useMemo(
    () => buildPtCraseFunnelBoard(normalized),
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

  if (funnelBoardModel) {
    return (
      <LogicFlowPtCraseFunnelBoard
        model={funnelBoardModel}
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
      eyebrow="Funil da crase"
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
