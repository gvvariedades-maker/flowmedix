'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  parseAdolescentZStep,
  Z_RAIL_MARKERS,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentZClassifyTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

/** Adapta kinds do parser Z → letter rail (mark = locate; threshold = eliminate). */
function toLetterSteps(
  parsed: ReturnType<typeof parseAdolescentZStep>[],
): { letter?: string; kind: string }[] {
  return parsed.map((step) => {
    if (step.kind === 'mark') return { letter: step.letter, kind: 'locate' };
    if (step.kind === 'threshold') return { letter: step.letter, kind: 'eliminate' };
    return { letter: step.letter, kind: step.kind };
  });
}

function ZClassifyRail({
  eliminated,
  winnerLetter,
  isComplete,
}: {
  eliminated: Set<string>;
  winnerLetter: string | null;
  isComplete: boolean;
}) {
  return (
    <div className="space-y-3">
      <div
        className="overflow-x-auto rounded-xl border-2 border-sky-200/80 bg-sky-50/70 px-2 py-3"
        role="img"
        aria-label="Trilho escore Z de −3 a +3"
      >
        <div className="flex min-w-[260px] items-center justify-between">
          {Z_RAIL_MARKERS.map((marker) => (
            <span
              key={marker}
              className={cn(
                'font-mono text-[10px] font-bold tabular-nums',
                marker === 0 ? 'text-sky-800' : 'text-slate-600',
              )}
            >
              {marker > 0 ? `+${marker}` : marker}
            </span>
          ))}
        </div>
        <div className="relative mt-2 h-1.5 rounded-full bg-gradient-to-r from-rose-300 via-sky-200 to-amber-300">
          <span
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-600 shadow"
            aria-hidden
          />
        </div>
      </div>
      <LetterEliminationRail
        eliminated={eliminated}
        winnerLetter={winnerLetter}
        isComplete={isComplete}
      />
    </div>
  );
}

/**
 * Escore Z Adolescente — FocusShell + trilho Z + letter rail (P1 lote 4).
 */
export function LogicFlowAdolescentZClassifyTap({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentZClassifyTapProps) {
  const letterSteps = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed = normalized.map((step, index) => parseAdolescentZStep(step, index));
    return toLetterSteps(parsed);
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Escore Z · classificar"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          letterSteps,
          activeStepIndex,
          isComplete,
        );
        return (
          <ZClassifyRail
            eliminated={eliminated}
            winnerLetter={winnerLetter}
            isComplete={isComplete}
          />
        );
      }}
    />
  );
}
