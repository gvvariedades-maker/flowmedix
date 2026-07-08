'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasCincinnatiBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasCincinnatiBoard(props: GoldenRuleUrgenciasCincinnatiBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_avc" />;
}
