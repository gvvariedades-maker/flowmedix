import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { CACHE_REVALIDATE_IMMEDIATE } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * Remove todo o histórico de questões do usuário autenticado (historico_questoes).
 * RLS: política DELETE com auth.uid() = user_id.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component — ignora
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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
