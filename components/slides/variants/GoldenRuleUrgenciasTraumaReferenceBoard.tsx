'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasTraumaReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência trauma pré-hospitalar — XABCDE e condutas. */
export function GoldenRuleUrgenciasTraumaReferenceBoard(
  props: GoldenRuleUrgenciasTraumaReferenceBoardProps,
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_trauma" />;
}
