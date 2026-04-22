import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

/**
 * Remove todo o histórico de questões do usuário autenticado (historico_questoes).
 * RLS: política DELETE com auth.uid() = user_id.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user, supabase } = auth;

    const { error: deleteError } = await supabase
      .from('historico_questoes')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      logger.error('Failed to clear historico_questoes', deleteError, { userId: user.id });
      return NextResponse.json({ error: 'Não foi possível zerar o desempenho' }, { status: 500 });
    }

    revalidateTag('historico', CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag(`user-${user.id}`, CACHE_REVALIDATE_IMMEDIATE);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in zerar-desempenho', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
