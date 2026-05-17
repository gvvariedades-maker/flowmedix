/**
 * DELETE /api/admin/modulos-estudo/[id]
 * Remove uma questão (linha em modulos_estudo) e referências por modulo_slug.
 * Apenas e-mail admin (mesma regra de POST /api/admin/questions).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { invalidateModulosCache, invalidateQuestoesCache, invalidateHistoricoCache } from '@/lib/cache';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!isAdminSessionEmail(session.user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const supabaseAdmin = await createServerSupabase();

  const { data: row, error: fetchError } = await supabaseAdmin
    .from('modulos_estudo')
    .select('id, modulo_slug, titulo_aula')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    logger.error('Admin delete modulo: fetch failed', fetchError, { id });
    return NextResponse.json({ error: 'Erro ao localizar questão' }, { status: 500 });
  }

  if (!row?.modulo_slug) {
    return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
  }

  const slug = row.modulo_slug as string;

  const { error: nbErr } = await supabaseAdmin.from('study_notebook_items').delete().eq('modulo_slug', slug);
  if (nbErr) {
    logger.warn('Admin delete: study_notebook_items', { message: nbErr.message, slug });
  }

  const { error: histErr } = await supabaseAdmin.from('historico_questoes').delete().eq('modulo_slug', slug);
  if (histErr) {
    logger.warn('Admin delete: historico_questoes', { message: histErr.message, slug });
  }

  const { error: delErr } = await supabaseAdmin.from('modulos_estudo').delete().eq('id', id);

  if (delErr) {
    logger.error('Admin delete modulos_estudo failed', delErr, { id, slug });
    return NextResponse.json({ error: 'Não foi possível excluir a questão' }, { status: 500 });
  }

  try {
    await Promise.all([invalidateModulosCache(), invalidateQuestoesCache(), invalidateHistoricoCache()]);
  } catch (e) {
    logger.warn('Cache revalidation failed after admin delete', {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  logger.info('Questão excluída pelo admin', {
    id,
    slug,
    titulo_aula: row.titulo_aula,
    email: session.user.email,
  });

  return NextResponse.json({ success: true, modulo_slug: slug });
}
