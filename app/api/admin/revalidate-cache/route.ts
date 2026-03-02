/**
 * API para admin invalidar cache de questões
 * Chamado após publicar questão no laboratório para que apareça na área do aluno
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAdminEmail } from '@/lib/constants';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Não precisa setar cookies nesta rota
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (email !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    await invalidateModulosCache();
    await invalidateQuestoesCache();
    logger.info('Cache invalidado pelo admin', { email });
    return NextResponse.json({ success: true, message: 'Cache invalidado' });
  } catch (error: any) {
    logger.error('Erro ao invalidar cache', error);
    return NextResponse.json(
      { error: 'Erro ao invalidar cache' },
      { status: 500 }
    );
  }
}
