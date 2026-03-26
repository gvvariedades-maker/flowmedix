import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modulo_slug, acertou, banca, topico, subtopico } = body;

    if (!modulo_slug || acertou === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component — ignora erros de set
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { error: insertError } = await supabase.from('historico_questoes').insert({
      user_id: user.id,
      modulo_slug,
      acertou,
      banca: banca || 'DESCONHECIDA',
      topico: topico || 'Geral',
      subtopico: subtopico || topico || 'Geral',
    });

    if (insertError) {
      logger.error('Failed to register attempt via API', insertError, { userId: user.id, modulo_slug });
      return NextResponse.json({ error: 'Erro ao registrar tentativa' }, { status: 500 });
    }

    // Invalida o cache do histórico do usuário imediatamente
    revalidateTag('historico');
    revalidateTag(`user-${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in registrar-tentativa', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
