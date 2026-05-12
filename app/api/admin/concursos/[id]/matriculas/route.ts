import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import { ConcursoAdminMatriculaSchema } from '@/lib/validations';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (email !== getAdminEmail()) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
  }

  return { admin: await createServerSupabase() };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id: routeConcursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoAdminMatriculaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  if (parsed.data.concursoId !== routeConcursoId) {
    return NextResponse.json({ error: 'Concurso da rota não confere com o payload' }, { status: 400 });
  }

  const { error } = await auth.admin.from('concurso_matriculas').upsert(
    {
      user_id: parsed.data.userId,
      concurso_id: parsed.data.concursoId,
      origem: 'admin',
    },
    { onConflict: 'user_id,concurso_id', ignoreDuplicates: true },
  );

  if (error) {
    logger.error('Falha na matrícula admin', error, parsed.data);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await invalidateUserModulosCache(parsed.data.userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após matrícula admin', {
      userId: parsed.data.userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }

  return NextResponse.json({ ok: true });
}
