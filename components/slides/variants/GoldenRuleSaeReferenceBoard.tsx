'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleSaeReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência SAE — privativas, anotação e COFEN em lentes. */
export function GoldenRuleSaeReferenceBoard(props: GoldenRuleSaeReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="sae" />;
}
