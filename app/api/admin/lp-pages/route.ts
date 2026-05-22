import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { listLpPagesForAdmin, revalidateLpPage } from '@/lib/lp/pages';
import { validateLpPathSegment } from '@/lib/lp/reservedPaths';
import { LpPageAdminCreateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

const LP_PAGE_SELECT =
  'id, path, template_id, status, internal_name, config, seo, utm_campaign, published_at, created_at, updated_at';

export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const pages = await listLpPagesForAdmin();
    return NextResponse.json({ pages });
  } catch (error) {
    logger.error('GET /api/admin/lp-pages', error);
    return NextResponse.json({ error: 'Erro ao listar landings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = LpPageAdminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 422 },
    );
  }

  const pathError = validateLpPathSegment(parsed.data.path);
  if (pathError) {
    return NextResponse.json({ error: pathError }, { status: 422 });
  }

  const path = parsed.data.path.trim().toLowerCase();

  const { data, error } = await auth.admin
    .from('lp_pages')
    .insert({
      path,
      template_id: parsed.data.template_id,
      status: 'rascunho',
      internal_name: parsed.data.internal_name,
      config: parsed.data.config,
      seo: parsed.data.seo,
      utm_campaign: parsed.data.utm_campaign ?? null,
      updated_at: new Date().toISOString(),
    })
    .select(LP_PAGE_SELECT)
    .single();

  if (error) {
    logger.error('Falha ao criar LP', error, { path });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ page: data });
}
