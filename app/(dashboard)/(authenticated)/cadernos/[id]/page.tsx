import { redirect, notFound } from 'next/navigation';
import { logger } from '@/lib/logger';
import { getModulosEstudoForUserCached, getHistoricoQuestoesCached } from '@/lib/cache';
import CadernoDetailClient from './CadernoDetailClient';
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

export default async function CadernoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

    const [modulos, historico] = await Promise.all([
      getModulosEstudoForUserCached(session.user.id),
      getHistoricoQuestoesCached(session.user.id),
    ]);

    const estudadosSet = new Set<string>(
      (historico as any[])
        .filter(h => h.estudo_reverso_concluido === true)
        .map(h => h.modulo_slug as string)
    );

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
      />
    );
  } catch (error) {
    logger.error('Failed to load caderno detail', error, { id });
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pb-safe">
        <p className="text-slate-500 text-sm">Erro ao carregar caderno. Tente novamente.</p>
      </div>
    );
  }
}
