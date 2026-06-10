import { NextRequest, NextResponse } from 'next/server';
import { invalidateNotebookActivationCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

// DELETE /api/notebooks/[id]/items/[itemId] — remove item do caderno
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: notebookId, itemId } = await params;
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const { data: notebook, error: notebookError } = await supabase
      .from('study_notebooks')
      .select('id')
      .eq('id', notebookId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (notebookError) throw notebookError;
    if (!notebook) return NextResponse.json({ error: 'Caderno não encontrado' }, { status: 404 });

    const { error } = await supabase
      .from('study_notebook_items')
      .delete()
      .eq('id', itemId)
      .eq('notebook_id', notebookId);

    if (error) throw error;

    void invalidateNotebookActivationCache(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/notebooks/[id]/items/[itemId] failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
