import { normalizeDesempenhoEstudoFilters } from '@/lib/desempenho/studyPerformance';
import type { DesempenhoEstudoFilters } from '@/lib/desempenho/types';

export type DesempenhoEstudoSearchParams = {
  periodo?: string | string[];
  banca?: string | string[];
  area?: string | string[];
  disciplina?: string | string[];
  assunto?: string | string[];
  captura?: string | string[];
  cursor?: string | string[];
  resultado?: string | string[];
};

export function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function filtersFromEstudoSearchParams(
  searchParams: DesempenhoEstudoSearchParams,
): DesempenhoEstudoFilters {
  return normalizeDesempenhoEstudoFilters({
    periodoRaw: firstSearchParam(searchParams.periodo),
    bancaRaw: firstSearchParam(searchParams.banca),
    areaRaw: firstSearchParam(searchParams.area),
    disciplinaRaw: firstSearchParam(searchParams.disciplina),
    assuntoRaw: firstSearchParam(searchParams.assunto),
  });
}
