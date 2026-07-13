'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

export function GoldenRuleIvExcetoCommandBoard(
  props: {
    content?: string;
    rows: GoldenRuleRow[];
    theme: ThemeColors;
    footerRule?: string;
  },
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="none" />;
}
