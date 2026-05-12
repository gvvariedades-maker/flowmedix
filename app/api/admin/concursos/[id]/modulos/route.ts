import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import { ConcursoModuloLinkSchema } from '@/lib/validations';
import { linkModuloToConcurso, unlinkModuloFromConcurso } from '@/lib/concursos/entitlements';
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

  const { id: concursoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = ConcursoModuloLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    await linkModuloToConcurso(concursoId, parsed.data.moduloId, parsed.data.origem);
    await invalidateModulosCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Falha ao vincular módulo ao concurso (admin)', error, {
      concursoId,
      moduloId: parsed.data.moduloId,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao vincular módulo' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id: concursoId } = await params;
  const moduloId = request.nextUrl.searchParams.get('moduloId')?.trim();
  if (!moduloId) {
    return NextResponse.json({ error: 'moduloId é obrigatório' }, { status: 400 });
  }

  try {
    await unlinkModuloFromConcurso(concursoId, moduloId);
    await invalidateModulosCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Falha ao desvincular módulo do concurso (admin)', error, { concursoId, moduloId });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao desvincular módulo' },
      { status: 400 },
    );
  }
}
