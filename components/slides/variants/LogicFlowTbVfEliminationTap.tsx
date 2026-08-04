'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  extractRomanFromText,
  inferTbVfItemStatus,
  type TbVfItemStatus,
} from '@/lib/slides/tuberculoseSlideUtils';
import {
  LogicFocusShell,
  RomanVfStatusRail,
  romanVfStatusFromSteps,
} from '../logicFlowShells';

interface LogicFlowTbVfEliminationTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

type ParsedStep = {
  raw: string;
  roman: 'I' | 'II' | 'III' | null;
  status: TbVfItemStatus;
};

function parseStep(step: string): ParsedStep {
  return {
    raw: step,
    roman: extractRomanFromText(step),
    status: inferTbVfItemStatus(step),
  };
}

/** Tb V/F — FocusShell + trilho romano I–III (P1 lote 3). */
export function LogicFlowTbVfEliminationTap({
  steps,
  theme,
  footerRule,
}: LogicFlowTbVfEliminationTapProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map(parseStep);
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Tuberculose · V/F"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex }) => {
        const status = romanVfStatusFromSteps(parsed, activeStepIndex);
        return <RomanVfStatusRail status={status} />;
      }}
    />
  );
}
