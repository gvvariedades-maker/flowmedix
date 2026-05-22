import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { revalidateLpPage } from '@/lib/lp/pages';
import { validateLpPathSegment } from '@/lib/lp/reservedPaths';
import { LpPageAdminUpdateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

const LP_PAGE_SELECT =
  'id, path, template_id, status, internal_name, config, seo, utm_campaign, published_at, created_at, updated_at';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const { data, error } = await auth.admin
    .from('lp_pages')
    .select(LP_PAGE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.error('GET lp-page', error, { id });
    return NextResponse.json({ error: 'Erro ao carregar landing' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Landing não encontrada' }, { status: 404 });
  }
  return NextResponse.json({ page: data });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = LpPageAdminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.template_id !== undefined) patch.template_id = parsed.data.template_id;
  if (parsed.data.internal_name !== undefined) patch.internal_name = parsed.data.internal_name;
  if (parsed.data.config !== undefined) patch.config = parsed.data.config;
  if (parsed.data.seo !== undefined) patch.seo = parsed.data.seo;
  if (parsed.data.utm_campaign !== undefined) patch.utm_campaign = parsed.data.utm_campaign;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;

  if (parsed.data.path !== undefined) {
    const pathError = validateLpPathSegment(parsed.data.path);
    if (pathError) {
      return NextResponse.json({ error: pathError }, { status: 422 });
    }
    patch.path = parsed.data.path.trim().toLowerCase();
  }

  const { data: existing } = await auth.admin.from('lp_pages').select('path').eq('id', id).maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: 'Landing não encontrada' }, { status: 404 });
  }

  const { data, error } = await auth.admin
    .from('lp_pages')
    .update(patch)
    .eq('id', id)
    .select(LP_PAGE_SELECT)
    .single();

  if (error) {
    logger.error('PATCH lp-page', error, { id });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await revalidateLpPage(existing.path);
  if (data.path !== existing.path) {
    await revalidateLpPage(data.path);
  }

  return NextResponse.json({ page: data });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;

  const { data: existing } = await auth.admin
    .from('lp_pages')
    .select('path, status')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Landing não encontrada' }, { status: 404 });
  }

  const { data, error } = await auth.admin
    .from('lp_pages')
    .update({ status: 'arquivado', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(LP_PAGE_SELECT)
    .single();

  if (error) {
    logger.error('DELETE (arquivar) lp-page', error, { id });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await revalidateLpPage(existing.path);
  return NextResponse.json({ page: data });
}
