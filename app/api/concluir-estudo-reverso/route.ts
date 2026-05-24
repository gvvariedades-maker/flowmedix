import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modulo_slug } = body;

    if (!modulo_slug || typeof modulo_slug !== 'string') {
      return NextResponse.json({ error: 'modulo_slug obrigatório' }, { status: 400 });
    }

    const auth = await getUserAndClientFromBearer(request);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { user } = auth;

    const supabase = await createServerSupabase();

    const { count, error: countError } = await supabase
      .from('historico_questoes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('modulo_slug', modulo_slug);

    if (countError) {
      logger.error('Failed to lookup historico for estudo reverso', countError, {
        userId: user.id,
        modulo_slug,
      });
      return NextResponse.json({ error: 'Erro ao consultar histórico' }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      const { error: updateError } = await supabase
        .from('historico_questoes')
        .update({ estudo_reverso_concluido: true })
        .eq('user_id', user.id)
        .eq('modulo_slug', modulo_slug);

      if (updateError) {
        logger.error('Failed to mark estudo reverso as concluido', updateError, {
          userId: user.id,
          modulo_slug,
        });
        return NextResponse.json({ error: 'Erro ao atualizar registro' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from('historico_questoes').insert({
        user_id: user.id,
        modulo_slug,
        acertou: false,
        estudo_reverso_concluido: true,
        banca: 'DESCONHECIDA',
        topico: 'Geral',
        subtopico: 'Geral',
      });

      if (insertError) {
        logger.error('Failed to insert estudo reverso concluido', insertError, {
          userId: user.id,
          modulo_slug,
        });
        return NextResponse.json({ error: 'Erro ao registrar conclusão' }, { status: 500 });
      }
    }

    revalidateTag('historico', CACHE_REVALIDATE_IMMEDIATE);
    revalidateTag(`user-${user.id}`, CACHE_REVALIDATE_IMMEDIATE);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in concluir-estudo-reverso', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
