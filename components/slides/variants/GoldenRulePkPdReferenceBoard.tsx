'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRulePkPdReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência PK/PD — lentes interativas (cinética, dinâmica, meia-vida). */
export function GoldenRulePkPdReferenceBoard(props: GoldenRulePkPdReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="farmaco" />;
}
