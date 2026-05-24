/**
 * DELETE /api/admin/modulos-estudo/[id]
 * Remove uma questão (linha em modulos_estudo) e referências por modulo_slug.
 * Apenas e-mail admin (mesma regra de POST /api/admin/questions).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';
import { invalidateModulosCache, invalidateQuestoesCache, invalidateHistoricoCache } from '@/lib/cache';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const { data: row, error: fetchError } = await auth.admin
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

  const { error: nbErr } = await auth.admin.from('study_notebook_items').delete().eq('modulo_slug', slug);
  if (nbErr) {
    logger.warn('Admin delete: study_notebook_items', { message: nbErr.message, slug });
  }

  const { error: histErr } = await auth.admin.from('historico_questoes').delete().eq('modulo_slug', slug);
  if (histErr) {
    logger.warn('Admin delete: historico_questoes', { message: histErr.message, slug });
  }

  const { error: delErr } = await auth.admin.from('modulos_estudo').delete().eq('id', id);

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
    email: auth.email,
  });

  return NextResponse.json({ success: true, modulo_slug: slug });
}
