'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasProtocolReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasProtocolReferenceBoard(
  props: GoldenRuleUrgenciasProtocolReferenceBoardProps,
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_protocol" />;
}
