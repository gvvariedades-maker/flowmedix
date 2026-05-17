import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import { ConcursoRegraModulosSchema } from '@/lib/validations';
import { linkModulosPorRegra } from '@/lib/concursos/entitlements';
import { invalidateModulosCache } from '@/lib/cache';
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
  if (!isAdminSessionEmail(email)) {
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

  const { id: concursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoRegraModulosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const linkedCount = await linkModulosPorRegra(concursoId, parsed.data);
    await invalidateModulosCache();
    return NextResponse.json({ ok: true, linkedCount });
  } catch (error) {
    logger.error('Falha ao aplicar regra de módulos no concurso', error, { concursoId, filters: parsed.data });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao aplicar regra' },
      { status: 400 },
    );
  }
}
