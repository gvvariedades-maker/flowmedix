'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasExcetoReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasExcetoReferenceBoard(props: GoldenRuleUrgenciasExcetoReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_exceto" />;
}
