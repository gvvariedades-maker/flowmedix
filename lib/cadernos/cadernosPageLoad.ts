import { getHistoricoQuestoesCached, getMatriculatedConcursosCached } from '@/lib/cache';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import {
  buildNotebookSummaries,
  clonedByPackIdFromSummaries,
  estudadosSetFromHistorico,
  type NotebookItemRow,
  type NotebookRow,
  type NotebookSummary,
} from '@/lib/cadernos/notebookSummary';
import {
  resolvePacks,
  type PackHistoricoRow,
  type ResolvedPack,
} from '@/lib/cadernos/resolvePacks';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';

export type CadernosListCore = {
  summaries: NotebookSummary[];
  notebooks: NotebookRow[];
  itemsByNotebook: Map<string, NotebookItemRow[]>;
  editalBanca: string | null;
};

export type CadernosListEnriched = {
  summaries: NotebookSummary[];
  packs: ResolvedPack[];
  editalBanca: string | null;
};

async function fetchNotebooksAndItems(
  userId: string,
): Promise<{ notebooks: NotebookRow[]; itemsByNotebook: Map<string, NotebookItemRow[]> }> {
  const supabase = await createSupabaseServerClient();
  const { data: notebooks, error } = await supabase
    .from('study_notebooks')
    .select('id, title, description, updated_at, source_pack_id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const rows = (notebooks || []) as NotebookRow[];
  const itemsByNotebook = new Map<string, NotebookItemRow[]>();
  const ids = rows.map((notebook) => notebook.id);

  if (ids.length > 0) {
    const { data: allItems } = await supabase
      .from('study_notebook_items')
      .select('notebook_id, modulo_slug, position, titulo_aula, topico')
      .in('notebook_id', ids);

    for (const row of allItems || []) {
      const arr = itemsByNotebook.get(row.notebook_id) || [];
      arr.push({
        modulo_slug: row.modulo_slug,
        position: row.position,
        titulo_aula: row.titulo_aula,
        topico: row.topico,
      });
      itemsByNotebook.set(row.notebook_id, arr);
    }
    for (const id of ids) {
      const arr = itemsByNotebook.get(id) || [];
      arr.sort((a, b) => a.position - b.position);
      itemsByNotebook.set(id, arr);
    }
  }

  return { notebooks: rows, itemsByNotebook };
}

/**
 * P0 da lista `/cadernos`: cadernos + itens + banca do edital.
 * Não espera histórico nem catálogo — progresso e packs ficam no enrich.
 */
export async function loadCadernosListCore(userId: string): Promise<CadernosListCore> {
  const [{ notebooks, itemsByNotebook }, matriculatedConcursos] = await Promise.all([
    fetchNotebooksAndItems(userId),
    getMatriculatedConcursosCached(userId).catch(() => []),
  ]);

  const editalBanca =
    matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.banca ?? null;

  return {
    notebooks,
    itemsByNotebook,
    editalBanca,
    summaries: buildNotebookSummaries(notebooks, itemsByNotebook, new Set()),
  };
}

/**
 * P1: histórico + catálogo. Anel de progresso, próxima questão e packs prontos.
 */
export async function loadCadernosListEnrichment(
  userId: string,
  core: CadernosListCore,
  isAdmin: boolean,
): Promise<CadernosListEnriched> {
  const [historico, modulos] = await Promise.all([
    getHistoricoQuestoesCached(userId),
    resolveAccessibleModulosWhenEmpty(userId, isAdmin).catch(() => []),
  ]);

  const historicoRows = (historico || []) as PackHistoricoRow[];
  const summaries = buildNotebookSummaries(
    core.notebooks,
    core.itemsByNotebook,
    estudadosSetFromHistorico(historicoRows),
  );

  return {
    summaries,
    editalBanca: core.editalBanca,
    packs: resolvePacks({
      modulos,
      historico: historicoRows,
      editalBanca: core.editalBanca,
      clonedByPackId: clonedByPackIdFromSummaries(summaries),
    }),
  };
}

export function logCadernosLoadError(error: unknown, userId?: string): void {
  logger.error('Failed to load cadernos', error, userId ? { userId } : undefined);
}
