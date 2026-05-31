import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import { VitrineQuerySchema } from '@/lib/validations';

export type VitrineListQuery = {
  page: number;
  bancas: string[];
  assuntos: string[];
  q?: string;
};

const DEFAULT_LIST_QUERY: VitrineListQuery = {
  page: 1,
  bancas: [],
  assuntos: [],
};

function pageSearchParamsToQueryRecord(
  params: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) sp.append(key, item);
    } else {
      sp.set(key, value);
    }
  }
  return searchParamsToQueryRecord(sp);
}

/** Mesma normalização de `GET /api/vitrine` — usada no SSR e no cliente. */
export function parseVitrineListQuery(
  params: Record<string, string | string[] | undefined>,
): VitrineListQuery {
  const parsed = VitrineQuerySchema.safeParse(pageSearchParamsToQueryRecord(params));
  if (!parsed.success) return DEFAULT_LIST_QUERY;

  return {
    page: parsed.data.page,
    bancas: parsed.data.bancas ?? [],
    assuntos: parsed.data.assuntos ?? [],
    q: parsed.data.q,
  };
}

export function vitrineListQueryKey(query: VitrineListQuery): string {
  return JSON.stringify({
    page: query.page,
    bancas: [...query.bancas].sort(),
    assuntos: [...query.assuntos].sort(),
    q: query.q?.trim() || '',
  });
}

export function vitrineFacetsQueryKey(bancas: string[]): string {
  return JSON.stringify([...bancas].sort());
}
