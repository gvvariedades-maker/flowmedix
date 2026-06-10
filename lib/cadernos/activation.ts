import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import { withPostgrestReadRetry } from '@/lib/supabaseReadRetry';

export type NotebookActivationStatus = {
  notebookCount: number;
  /** Pelo menos um item em algum caderno do usuário (join notebooks + items). */
  hasNotebookWithItems: boolean;
  emptyNotebookCount: number;
};

export const EMPTY_NOTEBOOK_ACTIVATION: NotebookActivationStatus = {
  notebookCount: 0,
  hasNotebookWithItems: false,
  emptyNotebookCount: 0,
};

/**
 * Status de ativação de cadernos para onboarding/engajamento.
 * Usa service role com filtro explícito por userId (padrão de cache por usuário).
 */
export async function getNotebookActivationStatus(
  userId: string,
): Promise<NotebookActivationStatus> {
  const { createServerSupabase } = await import('@/lib/supabase/server');
  const supabase = await createServerSupabase();
  const label = `notebook-activation:${userId.slice(0, 8)}…`;

  const notebooks = await withPostgrestReadRetry(label, async () =>
    supabase.from('study_notebooks').select('id').eq('user_id', userId),
  );

  const notebookCount = notebooks?.length ?? 0;
  if (notebookCount === 0) {
    return EMPTY_NOTEBOOK_ACTIVATION;
  }

  const notebookIds = notebooks!.map((n) => n.id);

  const itemProbe = await withPostgrestReadRetry(`${label}:exists`, async () =>
    supabase
      .from('study_notebook_items')
      .select('notebook_id')
      .in('notebook_id', notebookIds)
      .limit(1),
  );

  const hasNotebookWithItems = (itemProbe?.length ?? 0) > 0;
  if (!hasNotebookWithItems) {
    return {
      notebookCount,
      hasNotebookWithItems: false,
      emptyNotebookCount: notebookCount,
    };
  }

  const itemRows = await withPostgrestReadRetry(`${label}:notebook-ids`, async () =>
    supabase
      .from('study_notebook_items')
      .select('notebook_id')
      .in('notebook_id', notebookIds),
  );

  const notebooksWithItems = new Set(
    (itemRows ?? []).map((row) => row.notebook_id as string),
  );
  const emptyNotebookCount = notebookCount - notebooksWithItems.size;

  if (emptyNotebookCount < 0) {
    throw new DataServiceUnavailableError();
  }

  return {
    notebookCount,
    hasNotebookWithItems: true,
    emptyNotebookCount,
  };
}
