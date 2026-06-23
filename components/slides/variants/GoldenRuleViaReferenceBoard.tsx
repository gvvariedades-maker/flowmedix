'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleViaReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência Vias — lentes interativas (V/F, absorção, sítio). */
export function GoldenRuleViaReferenceBoard(props: GoldenRuleViaReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="via" />;
}
