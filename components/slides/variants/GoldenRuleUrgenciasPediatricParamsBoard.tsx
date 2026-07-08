'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasPediatricParamsBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasPediatricParamsBoard(
  props: GoldenRuleUrgenciasPediatricParamsBoardProps,
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_pediatric" />;
}
