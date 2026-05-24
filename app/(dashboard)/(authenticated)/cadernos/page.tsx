import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { getHistoricoQuestoesCached } from '@/lib/cache';
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
  updated_at: string;
}

export default async function CadernosPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const supabase = await createSupabaseServerClient();

  try {
    const [{ data: notebooks, error }, historico] = await Promise.all([
      supabase
        .from('study_notebooks')
        .select('id, title, description, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false }),
      getHistoricoQuestoesCached(session.user.id),
    ]);

    if (error) throw error;

    const estudadosSet = new Set<string>(
      ((historico as { modulo_slug?: string; estudo_reverso_concluido?: boolean }[]) || [])
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug as string),
    );

    const ids = (notebooks || []).map((n) => n.id);
    const itemsByNotebook = new Map<string, { modulo_slug: string; position: number }[]>();

    if (ids.length > 0) {
      const { data: allItems } = await supabase
        .from('study_notebook_items')
        .select('notebook_id, modulo_slug, position')
        .in('notebook_id', ids);

      for (const row of allItems || []) {
        const arr = itemsByNotebook.get(row.notebook_id) || [];
        arr.push({ modulo_slug: row.modulo_slug, position: row.position });
        itemsByNotebook.set(row.notebook_id, arr);
      }
      for (const id of ids) {
        const arr = itemsByNotebook.get(id) || [];
        arr.sort((a, b) => a.position - b.position);
        itemsByNotebook.set(id, arr);
      }
    }

    const studySlug = (items: { modulo_slug: string }[]): string | null => {
      if (items.length === 0) return null;
      const next = items.find((i) => !estudadosSet.has(i.modulo_slug));
      return (next ?? items[0]).modulo_slug;
    };

    const summaries: NotebookSummary[] = (notebooks || []).map((n) => {
      const items = itemsByNotebook.get(n.id) || [];
      const studiedCount = items.filter((i) => estudadosSet.has(i.modulo_slug)).length;
      return {
        ...n,
        itemCount: items.length,
        studiedCount,
        studyEntrySlug: studySlug(items),
      };
    });

    return <CadernosListClient cadernos={summaries} />;
  } catch (error) {
    logger.error('Failed to load cadernos', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#010409] p-6 pb-safe">
        <p className="text-sm text-slate-400">Erro ao carregar cadernos. Tente novamente.</p>
      </div>
    );
  }
}
