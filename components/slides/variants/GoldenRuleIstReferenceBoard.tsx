'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleIstReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência IST — reutiliza lentes interativas com rotas de risco. */
export function GoldenRuleIstReferenceBoard(props: GoldenRuleIstReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="ist" />;
}
