import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { revalidateLpPage } from '@/lib/lp/pages';
import { LpPageConfigSchema, LpPageSeoSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

const LP_PAGE_SELECT =
  'id, path, template_id, status, internal_name, config, seo, utm_campaign, published_at, created_at, updated_at';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;

  const { data: existing, error: fetchError } = await auth.admin
    .from('lp_pages')
    .select('id, path, config, seo, status')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    logger.error('publish: fetch lp-page', fetchError, { id });
    return NextResponse.json({ error: 'Erro ao carregar landing' }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'Landing não encontrada' }, { status: 404 });
  }

  if (!LpPageConfigSchema.safeParse(existing.config).success) {
    return NextResponse.json({ error: 'Config da LP inválida. Revise o formulário.' }, { status: 422 });
  }
  if (!LpPageSeoSchema.safeParse(existing.seo).success) {
    return NextResponse.json({ error: 'SEO da LP inválido. Revise o formulário.' }, { status: 422 });
  }

  const now = new Date().toISOString();
  const publishPatch: Record<string, string> = {
    status: 'ativo',
    updated_at: now,
  };
  if (existing.status !== 'ativo') {
    publishPatch.published_at = now;
  }

  const { data, error } = await auth.admin
    .from('lp_pages')
    .update(publishPatch)
    .eq('id', id)
    .select(LP_PAGE_SELECT)
    .single();

  if (error) {
    logger.error('publish lp-page', error, { id });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await revalidateLpPage(existing.path);
  return NextResponse.json({ page: data });
}
