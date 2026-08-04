'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniCatchUpCorpus,
  parsePniCalendarStep,
  pniMonthLabel,
} from '@/lib/slides/pniSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowPniCalendarEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

function MonthChips({ months }: { months: number[] }) {
  if (months.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5" aria-label="Marcos etários">
      {months.map((month) => (
        <span
          key={month}
          className="rounded-full bg-sky-100 px-2.5 py-1 font-mono text-[10px] font-black text-sky-900 ring-1 ring-sky-200/80"
        >
          {pniMonthLabel(month)}
        </span>
      ))}
    </div>
  );
}

/** Calendário PNI — FocusShell + letter rail + chips de mês (P1 lote 3). */
export function LogicFlowPniCalendarEliminationTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniCalendarEliminationTapProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parsePniCalendarStep(step, index)),
    [normalized],
  );
  const catchUpMode = useMemo(
    () => isPniCatchUpCorpus(normalized.join(' ')),
    [normalized],
  );

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow={catchUpMode ? 'Calendário catch-up' : 'Calendário PNI'}
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          parsed,
          activeStepIndex,
          isComplete,
        );
        const current = parsed[Math.min(activeStepIndex, Math.max(parsed.length - 1, 0))];
        return (
          <div className="flex flex-col gap-2">
            <LetterEliminationRail
              eliminated={eliminated}
              winnerLetter={winnerLetter}
              isComplete={isComplete}
            />
            {current?.months && current.months.length > 0 ? (
              <MonthChips months={current.months} />
            ) : null}
          </div>
        );
      }}
    />
  );
}
