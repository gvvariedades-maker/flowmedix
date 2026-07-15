'use client';

import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { GoldenRuleSoftLensBoard } from './GoldenRuleSoftLensBoard';

interface GoldenRuleSpNspReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Painel de referência NSP — lentes interativas (identificação, quedas, eventos). */
export function GoldenRuleSpNspReferenceBoard(props: GoldenRuleSpNspReferenceBoardProps) {
  return <GoldenRuleSoftLensBoard {...props} hintProfile="seguranca" />;
}
