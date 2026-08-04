'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  isPniVfColdChainCorpus,
  parsePniColdChainStep,
  pniTempLabel,
} from '@/lib/slides/pniSlideUtils';
import {
  LetterEliminationRail,
  LogicFocusShell,
  letterEliminationFromSteps,
} from '../logicFlowShells';

interface LogicFlowPniColdChainTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

function TempChips({ markers }: { markers: number[] }) {
  if (markers.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5" aria-label="Marcadores térmicos">
      {markers.map((marker) => (
        <span
          key={marker}
          className="rounded-full bg-teal-100 px-2.5 py-1 font-mono text-[10px] font-black text-teal-900 ring-1 ring-teal-200/80"
        >
          {pniTempLabel(marker)}°C
        </span>
      ))}
    </div>
  );
}

/** Rede de frio PNI — FocusShell + letter rail (MCQ) ou só chips (V/F) (P1 lote 3). */
export function LogicFlowPniColdChainTap({
  steps,
  theme,
  footerRule,
}: LogicFlowPniColdChainTapProps) {
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () => normalized.map((step, index) => parsePniColdChainStep(step, index)),
    [normalized],
  );
  const vfMode = useMemo(() => isPniVfColdChainCorpus(normalized.join(' ')), [normalized]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow={vfMode ? 'Cadeia de frio — V/F' : 'Rede de frio PNI'}
      applyTapBudget={false}
      renderHeader={({ activeStepIndex, isComplete }) => {
        const current = parsed[Math.min(activeStepIndex, Math.max(parsed.length - 1, 0))];
        const tempSlot =
          current?.markers && current.markers.length > 0 ? (
            <TempChips markers={current.markers} />
          ) : null;

        if (vfMode) {
          return tempSlot;
        }

        const { eliminated, winnerLetter } = letterEliminationFromSteps(
          parsed,
          activeStepIndex,
          isComplete,
        );
        return (
          <div className="flex flex-col gap-2">
            <LetterEliminationRail
              eliminated={eliminated}
              winnerLetter={winnerLetter}
              isComplete={isComplete}
            />
            {tempSlot}
          </div>
        );
      }}
    />
  );
}
