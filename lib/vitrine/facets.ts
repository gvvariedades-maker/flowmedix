import type { ModuloEstudoRow } from '@/lib/vitrineFilters';
import type { VitrineFacets } from '@/lib/vitrine/types';

/**
 * Facets para filtros da vitrine.
 * `assuntos` respeita `banca` quando informada (dropdown coerente).
 */
export function buildVitrineFacets(
  modulos: ModuloEstudoRow[],
  filters?: { banca?: string },
): VitrineFacets {
  const bancas = [...new Set(modulos.map((m) => m.banca).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

  const bancaFilter = filters?.banca?.trim();
  const baseForAssuntos = bancaFilter
    ? modulos.filter((m) => m.banca === bancaFilter)
    : modulos;

  const assuntos = [
    ...new Set(baseForAssuntos.map((m) => m.titulo_aula).filter((n): n is string => Boolean(n))),
  ].sort((a, b) => a.localeCompare(b));

  return { bancas, assuntos };
}
