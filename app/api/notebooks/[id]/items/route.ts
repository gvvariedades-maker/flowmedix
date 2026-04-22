import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

// POST /api/notebooks/[id]/items — adiciona item ao caderno
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notebookId } = await params;
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const body = await request.json();
    const { modulo_slug, titulo_aula, topico } = body;

    if (!modulo_slug) {
      return NextResponse.json({ error: 'modulo_slug obrigatório' }, { status: 400 });
    }

    const { data: notebook } = await supabase
      .from('study_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', user.id)
      .single();

    if (!notebook) return NextResponse.json({ error: 'Caderno não encontrado' }, { status: 404 });

    const { data: lastItem } = await supabase
      .from('study_notebook_items')
      .select('position')
      .eq('notebook_id', notebookId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = lastItem ? lastItem.position + 1 : 0;

    const { data, error } = await supabase
      .from('study_notebook_items')
      .insert({
        notebook_id: notebookId,
        modulo_slug,
        titulo_aula: titulo_aula || null,
        topico: topico || null,
        position: nextPosition,
      })
      .select('id, modulo_slug, titulo_aula, topico, position, added_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Questão já está no caderno' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/notebooks/[id]/items failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
