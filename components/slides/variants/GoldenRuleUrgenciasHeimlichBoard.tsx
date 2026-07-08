'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasHeimlichBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasHeimlichBoard(props: GoldenRuleUrgenciasHeimlichBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_engasgo" />;
}
