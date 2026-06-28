'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleRespiratorioSpo2ReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência SpO₂ / Asma × DPOC — lentes interativas. */
export function GoldenRuleRespiratorioSpo2ReferenceBoard(
  props: GoldenRuleRespiratorioSpo2ReferenceBoardProps,
) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="respiratorio" />;
}
