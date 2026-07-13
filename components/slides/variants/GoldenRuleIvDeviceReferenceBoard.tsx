'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleIvDeviceReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleIvDeviceReferenceBoard(props: GoldenRuleIvDeviceReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="none" />;
}
