'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleIvDifferentialBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel diferencial — complicações IV (mecanismo × sinal). */
export function GoldenRuleIvDifferentialBoard(props: GoldenRuleIvDifferentialBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="none" />;
}
