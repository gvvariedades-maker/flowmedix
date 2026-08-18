import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { getHistoricoQuestoesCached, getMatriculatedConcursosCached } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import {
  resolvePacks,
  type ClonedPackNotebook,
  type PackHistoricoRow,
  type ResolvedPack,
} from '@/lib/cadernos/resolvePacks';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { logger } from '@/lib/logger';
import CadernosListClient from './CadernosListClient';

export interface NotebookSummary {
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
}

function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function CadernosHubError() {
  return (
    <div
      className="flex min-h-full items-center justify-center bg-background p-6"
      data-cadernos-hub="lista"
      role="alert"
      aria-label="Erro ao carregar cadernos"
    >
      <p className="text-sm text-slate-500">Erro ao carregar cadernos. Tente novamente.</p>
    </div>
  );
}

export default async function CadernosPage({
  searchParams,
}: {
  searchParams?: Promise<{ captura?: string | string[] }>;
}) {
  const captura = searchParams
    ? firstSearchParam((await searchParams).captura)
    : null;

  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    if (captura === 'erro') return <CadernosHubError />;
    return <CadernosListClient cadernos={[]} editalBanca={null} packs={[]} />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const supabase = await createSupabaseServerClient();
  const isAdmin = isAdminSessionEmail(session.user.email ?? null);

  try {
    const [{ data: notebooks, error }, historico, matriculatedConcursos, modulos] =
      await Promise.all([
        supabase
          .from('study_notebooks')
          .select('id, title, description, updated_at, source_pack_id')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false }),
        getHistoricoQuestoesCached(session.user.id),
        getMatriculatedConcursosCached(session.user.id).catch(() => []),
        resolveAccessibleModulosWhenEmpty(session.user.id, isAdmin).catch(() => []),
      ]);

    if (error) throw error;

    const historicoRows = (historico || []) as PackHistoricoRow[];

    const estudadosSet = new Set<string>(
      historicoRows
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug),
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
        id: n.id,
        title: n.title,
        description: n.description,
        source_pack_id: n.source_pack_id ?? null,
        updated_at: n.updated_at ?? new Date(0).toISOString(),
        itemCount: items.length,
        studiedCount,
        studyEntrySlug: studyEntry.slug,
        studyEntryTitle: studyEntry.title,
        studyEntryPosition: studyEntry.position,
      };
    });

    const editalBanca =
      matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.banca ?? null;

    const clonedByPackId = new Map<string, ClonedPackNotebook>();
    for (const s of summaries) {
      if (!s.source_pack_id) continue;
      clonedByPackId.set(s.source_pack_id, {
        id: s.id,
        studyEntrySlug: s.studyEntrySlug,
        studiedCount: s.studiedCount,
        itemCount: s.itemCount,
      });
    }

    const packs: ResolvedPack[] = resolvePacks({
      modulos,
      historico: historicoRows,
      editalBanca,
      clonedByPackId,
    });

    return (
      <CadernosListClient cadernos={summaries} editalBanca={editalBanca} packs={packs} />
    );
  } catch (error) {
    logger.error('Failed to load cadernos', error);
    return <CadernosHubError />;
  }
}
