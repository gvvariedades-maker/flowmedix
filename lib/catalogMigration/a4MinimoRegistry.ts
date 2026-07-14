/**
 * Resolve qual pacote A4-mínimo aplica ao payload (ordem: Punção → História → …).
 */

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
  type A4MinimoAudit,
  type A4MinimoPackageConfig,
  type QuestaoLike,
} from '@/lib/catalogMigration/a4MinimoCore';
import { ADOLESCENTE_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/adolescenteA4Minimo';
import { FARMACO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/farmacoA4Minimo';
import { HISTORIA_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/historiaA4Minimo';
import { PUNCAO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/puncaoA4Minimo';
import { RESPIRATORIO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/respiratorioA4Minimo';
import { VIAS_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/viasA4Minimo';
import type { RiskResult } from '@/lib/catalogMigration/riskScoring';

/** Pacotes com A4-mínimo ligado (expandir nas ondas). */
export const A4_MINIMO_PACKAGES: readonly A4MinimoPackageConfig[] = [
  PUNCAO_A4_MINIMO_CONFIG,
  HISTORIA_A4_MINIMO_CONFIG,
  VIAS_A4_MINIMO_CONFIG,
  ADOLESCENTE_A4_MINIMO_CONFIG,
  FARMACO_A4_MINIMO_CONFIG,
  RESPIRATORIO_A4_MINIMO_CONFIG,
];

export function resolveA4MinimoConfig(
  subtopico: string,
): A4MinimoPackageConfig | null {
  return A4_MINIMO_PACKAGES.find((p) => p.isApplicable(subtopico)) ?? null;
}

export function auditAndMitigateA4Minimo(
  payload: QuestaoLike,
  risk: RiskResult,
  options?: { autoApprovalEnabled?: boolean },
): { cfg: A4MinimoPackageConfig | null; audit: A4MinimoAudit | null; risk: RiskResult } {
  const sub = payload.meta?.subtopico ?? '';
  const cfg = resolveA4MinimoConfig(sub);
  if (!cfg) return { cfg: null, audit: null, risk };
  const audit = auditA4Minimo(cfg, payload);
  const mitigated = applyA4MinimoMitigation(cfg, risk, audit, options);
  return { cfg, audit, risk: mitigated };
}
