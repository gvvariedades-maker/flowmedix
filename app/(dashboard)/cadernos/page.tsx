import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import CadernosListClient from './CadernosListClient';

export interface NotebookSummary {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  updated_at: string;
}

export default async function CadernosPage() {
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
    const { data: notebooks, error } = await supabase
      .from('study_notebooks')
      .select('id, title, description, updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const ids = (notebooks || []).map(n => n.id);
    let countMap: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: counts } = await supabase
        .from('study_notebook_items')
        .select('notebook_id')
        .in('notebook_id', ids);
      (counts || []).forEach((c: any) => {
        countMap[c.notebook_id] = (countMap[c.notebook_id] || 0) + 1;
      });
    }

    const summaries: NotebookSummary[] = (notebooks || []).map(n => ({
      ...n,
      itemCount: countMap[n.id] || 0,
    }));

    return <CadernosListClient cadernos={summaries} />;
  } catch (error) {
    logger.error('Failed to load cadernos', error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pb-safe">
        <p className="text-slate-500 text-sm">Erro ao carregar cadernos. Tente novamente.</p>
      </div>
    );
  }
}
