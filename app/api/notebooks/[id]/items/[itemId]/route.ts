import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

async function getSupabase() {
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
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// DELETE /api/notebooks/[id]/items/[itemId] — remove item do caderno
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: notebookId, itemId } = await params;
    const { supabase, user } = await getSupabase();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // RLS já protege — mas verificamos explicitamente para dar 404 correto
    const { data: notebook } = await supabase
      .from('study_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', user.id)
      .single();

    if (!notebook) return NextResponse.json({ error: 'Caderno não encontrado' }, { status: 404 });

    const { error } = await supabase
      .from('study_notebook_items')
      .delete()
      .eq('id', itemId)
      .eq('notebook_id', notebookId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/notebooks/[id]/items/[itemId] failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
