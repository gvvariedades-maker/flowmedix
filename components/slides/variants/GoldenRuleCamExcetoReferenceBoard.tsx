'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleCamExcetoReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleCamExcetoReferenceBoard(props: GoldenRuleCamExcetoReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="cam_exceto" />;
}
