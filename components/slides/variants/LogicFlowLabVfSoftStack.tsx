'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import {
  LogicFocusShell,
  RomanVfStatusRail,
  romanVfStatusFromSteps,
  type RomanVfItemStatus,
} from '../logicFlowShells';

interface LogicFlowLabVfSoftStackProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

function extractRoman(step: string): 'I' | 'II' | 'III' | null {
  const m = step.match(/\b(III|II|I)\b/);
  if (!m) return null;
  const r = m[1];
  return r === 'I' || r === 'II' || r === 'III' ? r : null;
}

function inferVfStatus(step: string): RomanVfItemStatus {
  const lower = step.toLowerCase();
  if (/\bfals[ao]\b|incorret|→\s*f\b|\bv\s*→\s*f\b/.test(lower)) return 'falsa';
  if (/\bverdadeir[ao]\b|corret|→\s*v\b/.test(lower)) return 'verdadeira';
  return 'neutra';
}

/**
 * Legado `lab-vf-soft-stack` — pilha V/F pastel → FocusShell + trilho romano (P1 lote 6).
 * Remove hardcode de gabarito no estado “completo”.
 */
export function LogicFlowLabVfSoftStack({
  steps,
  theme,
  revealMode = 'tap',
  footerRule,
}: LogicFlowLabVfSoftStackProps) {
  const parsed = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    return normalized.map((step) => ({
      roman: extractRoman(step),
      status: inferVfStatus(step),
    }));
  }, [steps]);

  return (
    <LogicFocusShell
      steps={steps}
      theme={theme}
      revealMode={revealMode}
      footerRule={footerRule}
      accent="clinical"
      eyebrow="Coleta · V/F"
      applyTapBudget={false}
      renderHeader={({ activeStepIndex }) => (
        <RomanVfStatusRail status={romanVfStatusFromSteps(parsed, activeStepIndex)} />
      )}
    />
  );
}
