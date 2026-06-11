import { NextRequest, NextResponse } from 'next/server';
import { invalidateNotebookActivationCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

// DELETE /api/notebooks/[id] — exclui o caderno inteiro (itens em CASCADE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { user, supabase } = auth;

    const { error } = await supabase
      .from('study_notebooks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    void invalidateNotebookActivationCache(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/notebooks/[id] failed', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
