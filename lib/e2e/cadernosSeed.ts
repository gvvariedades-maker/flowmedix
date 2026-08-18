import type { NotebookSummary } from '@/lib/cadernos/notebookSummary';
import { CADERNO_PACKS } from '@/lib/cadernos/packs';
import type { ResolvedPack } from '@/lib/cadernos/resolvePacks';

/** Delay do stream P1 no bypass — o P0 precisa ficar observável no Playwright. */
export const E2E_CADERNOS_P1_DELAY_MS = 1_200;

export const E2E_CADERNOS_NOTEBOOK_ID = 'e2e-nb-imuno';
export const E2E_CADERNOS_P0_SLUG = 'e2e-caderno-q1';
export const E2E_CADERNOS_P1_SLUG = 'e2e-caderno-q2';
export const E2E_CADERNOS_TITLE = 'E2E Imunização';

export const E2E_CADERNOS_P0_NOTEBOOK: NotebookSummary = {
  id: E2E_CADERNOS_NOTEBOOK_ID,
  title: E2E_CADERNOS_TITLE,
  description: 'Caderno de captura P0',
  source_pack_id: null,
  itemCount: 3,
  studiedCount: 0,
  studyEntrySlug: E2E_CADERNOS_P0_SLUG,
  studyEntryTitle: 'Dose 1',
  studyEntryPosition: 1,
  updated_at: '2026-08-01T00:00:00.000Z',
};

export const E2E_CADERNOS_P1_NOTEBOOK: NotebookSummary = {
  ...E2E_CADERNOS_P0_NOTEBOOK,
  studiedCount: 1,
  studyEntrySlug: E2E_CADERNOS_P1_SLUG,
  studyEntryTitle: 'Dose 2',
  studyEntryPosition: 2,
};

export function getE2eCadernosP1Pack(): ResolvedPack {
  const def = CADERNO_PACKS.find((pack) => pack.id === 'comece-10min') ?? CADERNO_PACKS[0];
  return {
    def,
    title: 'E2E Comece em 10 minutos',
    slugs: ['e2e-pack-q1'],
    items: [{ modulo_slug: 'e2e-pack-q1', titulo_aula: 'Pack Q1', topico: null }],
    estimatedMinutes: 3,
    clonedNotebookId: null,
    entrySlug: 'e2e-pack-q1',
    studiedCount: 0,
    cta: 'start',
  };
}

export function e2eCadernosStudyHref(slug: string): string {
  return `/estudar/${slug}?from=caderno&caderno_id=${E2E_CADERNOS_NOTEBOOK_ID}`;
}
