'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleFarmacoClinicoReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência clínica — diluente, via, tempo, monitorização (IBP EV e similares). */
export function GoldenRuleFarmacoClinicoReferenceBoard(
  props: GoldenRuleFarmacoClinicoReferenceBoardProps,
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias_protocol" />;
}
