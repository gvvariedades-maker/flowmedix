import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { getEmailTemplateBySlug, updateEmailTemplate } from '@/lib/email/templates';
import { EmailTemplateUpdateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { slug } = await params;
  try {
    const template = await getEmailTemplateBySlug(slug, auth.admin);
    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ template });
  } catch (error) {
    logger.error('GET /api/admin/email-templates/[slug]', error, { slug });
    return NextResponse.json({ error: 'Erro ao carregar template' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = EmailTemplateUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    );
  }

  if (slug === 'welcome' && parsed.data.content) {
    const h = parsed.data.content.headline;
    if (!h.includes('{{firstName}}') && !h.toLowerCase().includes('olá')) {
      return NextResponse.json(
        {
          error:
            'No boas-vindas, use {{firstName}} no título (ex.: Olá, {{firstName}}!). Sem nome, substituímos por «técnico de enfermagem».',
        },
        { status: 422 },
      );
    }
  }

  try {
    const existing = await getEmailTemplateBySlug(slug, auth.admin);
    if (!existing) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    const template = await updateEmailTemplate(slug, parsed.data, auth.admin);
    return NextResponse.json({ template, message: 'Template salvo.' });
  } catch (error) {
    logger.error('PATCH /api/admin/email-templates/[slug]', error, { slug });
    return NextResponse.json({ error: 'Erro ao salvar template' }, { status: 500 });
  }
}
