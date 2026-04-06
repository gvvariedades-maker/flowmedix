import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import { getModulosEstudoCached, getHistoricoQuestoesCached } from '@/lib/cache';
import CadernoDetailClient from './CadernoDetailClient';

export interface NotebookItem {
  id: string;
  modulo_slug: string;
  titulo_aula: string | null;
  topico: string | null;
  position: number;
  estudada: boolean;
  avant_codigo: number | null;
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
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');

  try {
    const [
      { data: notebook, error: nbError },
      { data: items, error: itemsError },
      modulos,
      historico,
    ] = await Promise.all([
      supabase
        .from('study_notebooks')
        .select('id, title, description')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('study_notebook_items')
        .select('id, modulo_slug, titulo_aula, topico, position')
        .eq('notebook_id', id)
        .order('position', { ascending: true }),
      getModulosEstudoCached(),
      getHistoricoQuestoesCached(session.user.id),
    ]);

    if (nbError || !notebook) return notFound();
    if (itemsError) throw itemsError;

    const estudadosSet = new Set<string>(
      (historico as any[])
        .filter(h => h.estudo_reverso_concluido === true)
        .map(h => h.modulo_slug as string)
    );

    const codigoPorSlug = new Map<string, number | null>();
    (modulos as { modulo_slug: string; avant_codigo?: number | null }[]).forEach((m) => {
      codigoPorSlug.set(
        m.modulo_slug,
        m.avant_codigo != null && !Number.isNaN(Number(m.avant_codigo)) ? Number(m.avant_codigo) : null,
      );
    });

    const notebookItems: NotebookItem[] = (items || []).map(item => ({
      ...item,
      estudada: estudadosSet.has(item.modulo_slug),
      avant_codigo: codigoPorSlug.get(item.modulo_slug) ?? null,
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
