/**
 * Contrato canônico do cluster report — limiar e decisões por volume.
 * @see docs/L3_MAPEAMENTO_CONVERSA.md § Contrato do cluster report
 */

export type ClusterDecision = 'novo_ramo' | 'absorver' | 'cauda_longa' | 'coberto';

/** Mínimo de slugs para `absorver` (abaixo do limiar de ramo forte). */
export const ABSORVER_MIN_COUNT = 3;

/**
 * Limiar de ramo forte: max(5, ceil(10% do total)).
 * Usado por todos os `scripts/cluster-*-topics.ts`.
 */
export function strongBranchThreshold(total: number): number {
  if (total <= 0) return 5;
  return Math.max(5, Math.ceil(total * 0.1));
}

export function resolveClusterDecision(args: {
  hasGolden: boolean;
  count: number;
  total: number;
}): ClusterDecision {
  const { hasGolden, count, total } = args;
  if (hasGolden) return 'coberto';
  const threshold = strongBranchThreshold(total);
  if (count >= threshold) return 'novo_ramo';
  if (count >= ABSORVER_MIN_COUNT) return 'absorver';
  return 'cauda_longa';
}
