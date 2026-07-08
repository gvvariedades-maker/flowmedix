'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasShockReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasShockReferenceBoard(props: GoldenRuleUrgenciasShockReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_choque" />;
}
