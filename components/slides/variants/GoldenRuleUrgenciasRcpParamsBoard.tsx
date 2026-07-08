'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleUrgenciasRcpParamsBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de parâmetros RCP adulto — lentes interativas com badges hot/warn. */
export function GoldenRuleUrgenciasRcpParamsBoard(props: GoldenRuleUrgenciasRcpParamsBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="urgencias" />;
}
