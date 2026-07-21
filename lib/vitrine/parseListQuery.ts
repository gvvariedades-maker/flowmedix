import { searchParamsToQueryRecord } from '@/lib/api/query-params';
import type { VitrineStatusFilter } from '@/lib/vitrine/filterGroups';
import { parseVitrineDisciplina, type VitrineDisciplinaId } from '@/lib/vitrine/disciplina';
import { VitrineQuerySchema } from '@/lib/validations';

export type VitrineViewMode = 'grid' | 'compact';

export const VITRINE_VIEW_STORAGE_KEY = 'avant.vitrine.view';

export type VitrineListQuery = {
  page: number;
  bancas: string[];
  assuntos: string[];
  q?: string;
  /** Filtro rápido client-side — `?status=pending|new|all`. */
  status: VitrineStatusFilter;
  /** Vista da lista — `?view=compact|grid`; default persiste em localStorage no client. */
  view: VitrineViewMode;
  /** Disciplina — `?disciplina=enfermagem|portugues`. */
  disciplina: VitrineDisciplinaId | null;
};

const DEFAULT_LIST_QUERY: VitrineListQuery = {
  page: 1,
  bancas: [],
  assuntos: [],
  status: 'all',
  view: 'grid',
  disciplina: null,
};

function readSingleSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseVitrineStatus(raw: string | undefined): VitrineStatusFilter {
  if (raw === 'pending' || raw === 'new') return raw;
  return 'all';
}

export function parseVitrineView(raw: string | undefined): VitrineViewMode {
  return raw === 'compact' ? 'compact' : 'grid';
}

export function readStoredVitrineView(): VitrineViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const stored = window.localStorage.getItem(VITRINE_VIEW_STORAGE_KEY);
    if (stored === 'compact' || stored === 'grid') return stored;
  } catch {
    /* ignore quota / private mode */
  }
  return 'grid';
}

export function writeStoredVitrineView(view: VitrineViewMode): void {
  try {
    window.localStorage.setItem(VITRINE_VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
}

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
    status: parseVitrineStatus(readSingleSearchParam(params, 'status')),
    view: parseVitrineView(readSingleSearchParam(params, 'view')),
    disciplina: parseVitrineDisciplina(readSingleSearchParam(params, 'disciplina')),
  };
}

/** Chave SWR/API — só filtros que disparam refetch (status/view são client-side). */
export type VitrineFetchQuery = Pick<
  VitrineListQuery,
  'page' | 'bancas' | 'assuntos' | 'q' | 'disciplina'
>;

export function vitrineListQueryKey(query: VitrineFetchQuery): string {
  return JSON.stringify({
    page: query.page,
    bancas: [...query.bancas].sort(),
    assuntos: [...query.assuntos].sort(),
    q: query.q?.trim() || '',
    disciplina: query.disciplina ?? '',
  });
}

export function vitrineFacetsQueryKey(bancas: string[]): string {
  return JSON.stringify([...bancas].sort());
}
