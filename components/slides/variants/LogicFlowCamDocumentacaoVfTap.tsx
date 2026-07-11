'use client';

import type { ThemeColors } from '../core/themeGenerator';
import { LogicFlowCamVfJuggleTap } from './LogicFlowCamVfJuggleTap';

interface LogicFlowCamDocumentacaoVfTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  footerRule?: string;
}

/** V/F I–III documentação — reutiliza juggle CAM com variant id próprio para affinity L3. */
export function LogicFlowCamDocumentacaoVfTap({
  steps,
  theme,
  footerRule,
}: LogicFlowCamDocumentacaoVfTapProps) {
  return <LogicFlowCamVfJuggleTap steps={steps} theme={theme} footerRule={footerRule} />;
}
