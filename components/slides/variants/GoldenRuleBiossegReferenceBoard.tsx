'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleBiossegReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência IRAS / precauções — lentes interativas com perfil biosseg. */
export function GoldenRuleBiossegReferenceBoard(props: GoldenRuleBiossegReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="biosseg" />;
}
