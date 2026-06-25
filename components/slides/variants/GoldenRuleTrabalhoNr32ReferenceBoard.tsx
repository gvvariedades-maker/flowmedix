'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleTrabalhoNr32ReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência NR-32 — lentes interativas (norma, vacina, PEP, EPI). */
export function GoldenRuleTrabalhoNr32ReferenceBoard(props: GoldenRuleTrabalhoNr32ReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="trabalho" />;
}
