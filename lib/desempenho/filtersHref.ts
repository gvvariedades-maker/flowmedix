/**
 * URL é a fonte de verdade dos filtros de `/desempenho` (compartilhável, back/forward).
 * Só entra na query o que a agregação realmente aplica.
 */

import type { DesempenhoEstudoFilters } from '@/lib/desempenho/types';

export function buildDesempenhoHref(filters: DesempenhoEstudoFilters): string {
  const params = new URLSearchParams();
  if (filters.periodo !== 'all') params.set('periodo', filters.periodo);
  if (filters.banca) params.set('banca', filters.banca);
  if (filters.areaId) params.set('area', filters.areaId);
  if (filters.disciplina) params.set('disciplina', filters.disciplina);
  const qs = params.toString();
  return qs ? `/desempenho?${qs}` : '/desempenho';
}

/** Filtros ativos além do padrão (período `all`, sem recortes). */
export function countDesempenhoFiltrosAtivos(filters: DesempenhoEstudoFilters): number {
  let total = 0;
  if (filters.periodo !== 'all') total += 1;
  if (filters.disciplina) total += 1;
  if (filters.areaId) total += 1;
  if (filters.banca) total += 1;
  return total;
}

export const DESEMPENHO_FILTROS_LIMPOS: DesempenhoEstudoFilters = {
  periodo: 'all',
  banca: null,
  areaId: null,
  disciplina: null,
};
