/**
 * URL é a fonte de verdade dos filtros de `/desempenho` (compartilhável, back/forward).
 * Só entra na query o que a agregação realmente aplica.
 */

import type {
  DesempenhoEstudoFilters,
  HistoricoResultadoFilter,
} from '@/lib/desempenho/types';
import type { GrandeAreaId } from '@/lib/desempenho/taxonomiaEnfermagem';

export const DESEMPENHO_PATHS = {
  resumo: '/desempenho',
  mapa: '/desempenho/mapa',
  historico: '/desempenho/historico',
} as const;

export type DesempenhoEstudoPath =
  (typeof DESEMPENHO_PATHS)[keyof typeof DESEMPENHO_PATHS];

export function buildDesempenhoHref(
  filters: DesempenhoEstudoFilters,
  path: string = DESEMPENHO_PATHS.resumo,
): string {
  const params = new URLSearchParams();
  if (filters.periodo !== 'all') params.set('periodo', filters.periodo);
  if (filters.banca) params.set('banca', filters.banca);
  if (filters.areaId) params.set('area', filters.areaId);
  if (filters.disciplina) params.set('disciplina', filters.disciplina);
  if (filters.areaId && filters.assunto) params.set('assunto', filters.assunto);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function buildDesempenhoHistoricoHref(
  filters: DesempenhoEstudoFilters,
  extra?: {
    resultado?: HistoricoResultadoFilter;
    cursor?: string | null;
    captura?: string | null;
  },
): string {
  const base = buildDesempenhoHref(filters, DESEMPENHO_PATHS.historico);
  const params = new URLSearchParams(base.includes('?') ? base.split('?')[1] : '');
  if (extra?.resultado && extra.resultado !== 'todos') {
    params.set('resultado', extra.resultado);
  }
  if (extra?.cursor) params.set('cursor', extra.cursor);
  if (extra?.captura) params.set('captura', extra.captura);
  const qs = params.toString();
  const path = DESEMPENHO_PATHS.historico;
  return qs ? `${path}?${qs}` : path;
}

/** Trocar área zera o assunto (dependência). */
export function desempenhoFiltersWithArea(
  filters: DesempenhoEstudoFilters,
  areaId: GrandeAreaId | null,
): DesempenhoEstudoFilters {
  return {
    ...filters,
    areaId,
    assunto: areaId && areaId === filters.areaId ? filters.assunto : null,
  };
}

/** Filtros ativos além do padrão (período `all`, sem recortes). */
export function countDesempenhoFiltrosAtivos(filters: DesempenhoEstudoFilters): number {
  let total = 0;
  if (filters.periodo !== 'all') total += 1;
  if (filters.disciplina) total += 1;
  if (filters.areaId) total += 1;
  if (filters.banca) total += 1;
  if (filters.areaId && filters.assunto) total += 1;
  return total;
}

export const DESEMPENHO_FILTROS_LIMPOS: DesempenhoEstudoFilters = {
  periodo: 'all',
  banca: null,
  areaId: null,
  disciplina: null,
  assunto: null,
};
