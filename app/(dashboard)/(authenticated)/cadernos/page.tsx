import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { getHistoricoQuestoesCached, getMatriculatedConcursosCached } from '@/lib/cache';
import { logger } from '@/lib/logger';
import CadernosListClient from './CadernosListClient';

export interface NotebookSummary {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  studiedCount: number;
  /** Primeira questão a abrir no fluxo do caderno (não concluída na ordem, senão a primeira). */
  studyEntrySlug: string | null;
  /** Título da próxima questão (titulo_aula ou topico do item de entrada). */
  studyEntryTitle: string | null;
  /** Posição 1-based da próxima questão na ordem do caderno. */
  studyEntryPosition: number | null;
  updated_at: string;
}

export default async function CadernosPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const supabase = await createSupabaseServerClient();

  try {
    const [{ data: notebooks, error }, historico, matriculatedConcursos] = await Promise.all([
      supabase
        .from('study_notebooks')
        .select('id, title, description, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false }),
      getHistoricoQuestoesCached(session.user.id),
      getMatriculatedConcursosCached(session.user.id).catch(() => []),
    ]);

    if (error) throw error;

    const estudadosSet = new Set<string>(
      ((historico as { modulo_slug?: string; estudo_reverso_concluido?: boolean }[]) || [])
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug as string),
    );

    const ids = (notebooks || []).map((n) => n.id);
    const itemsByNotebook = new Map<
      string,
      { modulo_slug: string; position: number; titulo_aula: string | null; topico: string | null }[]
    >();

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

    type NotebookItemRow = {
      modulo_slug: string;
      titulo_aula: string | null;
      topico: string | null;
    };

    const resolveStudyEntry = (items: NotebookItemRow[]) => {
      if (items.length === 0) {
        return { slug: null, title: null, position: null };
      }
      const pendingIndex = items.findIndex((i) => !estudadosSet.has(i.modulo_slug));
      const entryIndex = pendingIndex >= 0 ? pendingIndex : 0;
      const entry = items[entryIndex];
      return {
        slug: entry.modulo_slug,
        title: entry.titulo_aula?.trim() || entry.topico?.trim() || null,
        position: entryIndex + 1,
      };
    };

    const summaries: NotebookSummary[] = (notebooks || []).map((n) => {
      const items = itemsByNotebook.get(n.id) || [];
      const studiedCount = items.filter((i) => estudadosSet.has(i.modulo_slug)).length;
      const studyEntry = resolveStudyEntry(items);
      return {
        ...n,
        itemCount: items.length,
        studiedCount,
        studyEntrySlug: studyEntry.slug,
        studyEntryTitle: studyEntry.title,
        studyEntryPosition: studyEntry.position,
      };
    });

    const editalBanca =
      matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.banca ?? null;

    return <CadernosListClient cadernos={summaries} editalBanca={editalBanca} />;
  } catch (error) {
    logger.error('Failed to load cadernos', error);
    return (
      <div className="flex min-h-full items-center justify-center bg-[#010409] p-6">
        <p className="text-sm text-slate-400">Erro ao carregar cadernos. Tente novamente.</p>
      </div>
    );
  }
}
