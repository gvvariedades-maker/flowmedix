import type { QuestaoDoAssunto } from '@/types/lesson';

/** Raio visível no carrossel: no máximo 2 * radius + 1 dots (5 centrais). */
export const DOTS_NAV_VISIBLE_RADIUS = 2;

export const DOTS_NAV_VISIBLE_MAX = DOTS_NAV_VISIBLE_RADIUS * 2 + 1;

export type DotsNavDot = {
  type: 'dot';
  questao: QuestaoDoAssunto & { indice: number };
};

export type DotsNavItem = DotsNavDot;

export interface BuildDotsNavWindowOptions {
  currentSlug?: string | null;
  /** Posição 1-based na lista completa (ex.: listaContexto.atual). */
  currentIndice?: number;
  /** Total na lista completa (ex.: listaContexto.total). */
  total?: number;
  radius?: number;
}

/**
 * Monta a faixa de dots visível no player: janela deslizante de até 5 itens
 * centrada na questão atual (carrossel truncado).
 */
export function buildDotsNavWindow(
  questoes: QuestaoDoAssunto[],
  options: BuildDotsNavWindowOptions = {},
): DotsNavItem[] {
  if (questoes.length === 0) return [];

  const radius = options.radius ?? DOTS_NAV_VISIBLE_RADIUS;
  const total = options.total ?? questoes.length;

  const byIndice = new Map<number, QuestaoDoAssunto>();
  for (let i = 0; i < questoes.length; i++) {
    const q = questoes[i];
    const indice = q.indice ?? i + 1;
    byIndice.set(indice, q);
  }

  let currentIndice = options.currentIndice;
  if (currentIndice == null && options.currentSlug) {
    const match = questoes.find((q) => q.slug === options.currentSlug);
    if (match) {
      currentIndice = match.indice ?? questoes.indexOf(match) + 1;
    }
  }
  if (currentIndice == null) currentIndice = 1;

  const visibleStart = Math.max(1, currentIndice - radius);
  const visibleEnd = Math.min(total, currentIndice + radius);

  const items: DotsNavItem[] = [];

  for (let indice = visibleStart; indice <= visibleEnd; indice++) {
    const questao = byIndice.get(indice);
    if (questao) {
      items.push({ type: 'dot', questao: { ...questao, indice } });
    }
  }

  return items;
}
