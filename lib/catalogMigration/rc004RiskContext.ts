/**
 * RC-004 — contexto de risco alinhado ao runtime (não ao apply-lote stock).
 *
 * Runtime: auto_approval ausente → enabled (default true).
 * @see commercialRuntimeGate.ts
 */
import type { RegistryPacote } from '@/lib/catalogMigration/handcraftRegistry';
import { canSell } from '@/lib/catalogMigration/shipGate';
import type { RiskScoringContext } from '@/lib/catalogMigration/riskScoring';

export function isPacoteAutoApprovalEnabled(pacote: RegistryPacote): boolean {
  return pacote.auto_approval?.enabled !== false;
}

export function resolveRiskScoringContextFromPacote(
  pacote: RegistryPacote,
): RiskScoringContext {
  return {
    productionReady: canSell(pacote),
    autoApprovalEnabled: isPacoteAutoApprovalEnabled(pacote),
  };
}
