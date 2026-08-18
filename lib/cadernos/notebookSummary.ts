import type { ClonedPackNotebook } from '@/lib/cadernos/resolvePacks';

export type NotebookSummary = {
  id: string;
  title: string;
  description: string | null;
  /** Pack de origem (`CADERNO_PACKS.id`); null = caderno manual. */
  source_pack_id: string | null;
  itemCount: number;
  studiedCount: number;
  /** Primeira questão a abrir no fluxo do caderno (não concluída na ordem, senão a primeira). */
  studyEntrySlug: string | null;
  /** Título da próxima questão (titulo_aula ou topico do item de entrada). */
  studyEntryTitle: string | null;
  /** Posição 1-based da próxima questão na ordem do caderno. */
  studyEntryPosition: number | null;
  updated_at: string;
};

export type NotebookRow = {
  id: string;
  title: string;
  description: string | null;
  source_pack_id: string | null;
  updated_at: string | null;
};

export type NotebookItemRow = {
  modulo_slug: string;
  position: number;
  titulo_aula: string | null;
  topico: string | null;
};

export function estudadosSetFromHistorico(
  historico: { modulo_slug: string; estudo_reverso_concluido?: boolean | null }[],
): Set<string> {
  return new Set(
    historico.filter((h) => h.estudo_reverso_concluido === true).map((h) => h.modulo_slug),
  );
}

export function resolveStudyEntry(items: NotebookItemRow[], estudadosSet: Set<string>) {
  if (items.length === 0) {
    return { slug: null, title: null, position: null };
  }
  const pendingIndex = items.findIndex((item) => !estudadosSet.has(item.modulo_slug));
  const entryIndex = pendingIndex >= 0 ? pendingIndex : 0;
  const entry = items[entryIndex];
  return {
    slug: entry.modulo_slug,
    title: entry.titulo_aula?.trim() || entry.topico?.trim() || null,
    position: entryIndex + 1,
  };
}

export function buildNotebookSummaries(
  notebooks: NotebookRow[],
  itemsByNotebook: Map<string, NotebookItemRow[]>,
  estudadosSet: Set<string>,
): NotebookSummary[] {
  return notebooks.map((notebook) => {
    const items = itemsByNotebook.get(notebook.id) || [];
    const studiedCount = items.filter((item) => estudadosSet.has(item.modulo_slug)).length;
    const studyEntry = resolveStudyEntry(items, estudadosSet);
    return {
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      source_pack_id: notebook.source_pack_id ?? null,
      updated_at: notebook.updated_at ?? new Date(0).toISOString(),
      itemCount: items.length,
      studiedCount,
      studyEntrySlug: studyEntry.slug,
      studyEntryTitle: studyEntry.title,
      studyEntryPosition: studyEntry.position,
    };
  });
}

export function clonedByPackIdFromSummaries(
  summaries: NotebookSummary[],
): Map<string, ClonedPackNotebook> {
  const clonedByPackId = new Map<string, ClonedPackNotebook>();
  for (const summary of summaries) {
    if (!summary.source_pack_id) continue;
    clonedByPackId.set(summary.source_pack_id, {
      id: summary.id,
      studyEntrySlug: summary.studyEntrySlug,
      studiedCount: summary.studiedCount,
      itemCount: summary.itemCount,
    });
  }
  return clonedByPackId;
}
