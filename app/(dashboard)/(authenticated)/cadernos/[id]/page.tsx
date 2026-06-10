import { redirect, notFound } from 'next/navigation';
import { logger } from '@/lib/logger';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  aggregateNotebookProgress,
  estudadosSetFromHistorico,
  getHistoricoQuestoesForSlugsCached,
  getMatriculatedConcursosCached,
} from '@/lib/cache';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import CadernoDetailClient from './CadernoDetailClient';
import CadernoDetailMetrics from '@/components/dashboard/cadernos/CadernoDetailMetrics';
import CadernoReverseStudyBadge from '@/components/dashboard/cadernos/CadernoReverseStudyBadge';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';

export interface NotebookItem {
  id: string;
  modulo_slug: string;
  titulo_aula: string | null;
  topico: string | null;
  position: number;
  estudada: boolean;
  avant_codigo: number | null;
  acessivel: boolean;
}

export interface ModuloDisponivel {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string | null;
  avant_codigo: number | null;
}

export interface CadernoDetail {
  id: string;
  title: string;
  description: string | null;
  items: NotebookItem[];
}

export type CadernoSetupMode = 'none' | 'setup' | 'done';

export default async function CadernoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string }>;
}) {
  const { id } = await params;
  const { setup: setupParam } = await searchParams;
  const setupMode: CadernoSetupMode =
    setupParam === 'done' ? 'done' : setupParam === '1' ? 'setup' : 'none';

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const supabase = await createSupabaseServerClient();

  try {
    // Evita corrida de refresh token no server: consultas Supabase autenticadas
    // nao podem rodar em paralelo quando o access token expira.
    const { data: notebook, error: nbError } = await supabase
      .from('study_notebooks')
      .select('id, title, description')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (nbError || !notebook) return notFound();

    const { data: items, error: itemsError } = await supabase
      .from('study_notebook_items')
      .select('id, modulo_slug, titulo_aula, topico, position')
      .eq('notebook_id', id)
      .order('position', { ascending: true });

    if (itemsError) throw itemsError;

    const slugs = (items ?? []).map((item) => item.modulo_slug);
    const isAdmin = isAdminSessionEmail(session.user.email ?? null);

    const [modulos, historico, matriculatedConcursos] = await Promise.all([
      resolveAccessibleModulosWhenEmpty(session.user.id, isAdmin),
      getHistoricoQuestoesForSlugsCached(session.user.id, slugs),
      getMatriculatedConcursosCached(session.user.id).catch(() => []),
    ]);

    const editalBanca =
      matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.banca ?? null;

    const stats = aggregateNotebookProgress(slugs, historico);
    const estudadosSet = estudadosSetFromHistorico(historico);

    const codigoPorSlug = new Map<string, number | null>();
    const accessibleSlugs = new Set<string>();
    (modulos as { modulo_slug: string; avant_codigo?: number | null }[]).forEach((m) => {
      accessibleSlugs.add(m.modulo_slug);
      codigoPorSlug.set(
        m.modulo_slug,
        m.avant_codigo != null && !Number.isNaN(Number(m.avant_codigo)) ? Number(m.avant_codigo) : null,
      );
    });

    const notebookItems: NotebookItem[] = (items || []).map(item => ({
      ...item,
      estudada: estudadosSet.has(item.modulo_slug),
      avant_codigo: codigoPorSlug.get(item.modulo_slug) ?? null,
      acessivel: accessibleSlugs.has(item.modulo_slug),
    }));

    const slugsNoCaderno = new Set(notebookItems.map(i => i.modulo_slug));

    const modulosDisponiveis: ModuloDisponivel[] = (modulos as any[])
      .filter(m => !slugsNoCaderno.has(m.modulo_slug))
      .map(m => ({
        id: m.id,
        modulo_slug: m.modulo_slug,
        modulo_nome: m.modulo_nome || null,
        titulo_aula: m.titulo_aula || null,
        banca: m.banca || null,
        avant_codigo:
          m.avant_codigo != null && !Number.isNaN(Number(m.avant_codigo)) ? Number(m.avant_codigo) : null,
      }));

    const caderno: CadernoDetail = {
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      items: notebookItems,
    };

    return (
      <CadernoDetailClient
        caderno={caderno}
        modulosDisponiveis={modulosDisponiveis}
        editalBanca={editalBanca}
        setupMode={setupMode}
        metricsSlot={<CadernoDetailMetrics stats={stats} />}
        reverseStudyBadgeSlot={<CadernoReverseStudyBadge />}
      />
    );
  } catch (error) {
    logger.error('Failed to load caderno detail', error, { id });
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-500 text-sm">Erro ao carregar caderno. Tente novamente.</p>
      </div>
    );
  }
}
