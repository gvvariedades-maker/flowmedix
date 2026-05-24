import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { getEmailTemplateBySlug, sendTemplatedEmail } from '@/lib/email/templates';
import { getResendServerConfig } from '@/lib/env';
import { EmailTemplateUpdateSchema } from '@/lib/validations';
import { mergeEmailContent } from '@/lib/email/templateContent';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ slug: string }> };

/** Envia preview do template para o e-mail do admin logado. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  if (!getResendServerConfig()) {
    return NextResponse.json(
      { error: 'Resend não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL)' },
      { status: 503 },
    );
  }

  const { slug } = await params;

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const draft = EmailTemplateUpdateSchema.safeParse(body);
  if (!draft.success && Object.keys(body as object).length > 0) {
    return NextResponse.json(
      { error: draft.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    );
  }

  try {
    const template = await getEmailTemplateBySlug(slug, auth.admin);
    if (!template) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    const merged = draft.success
      ? {
          ...template,
          subject: draft.data.subject ?? template.subject,
          preview_text: draft.data.preview_text ?? template.preview_text,
          content: draft.data.content
            ? mergeEmailContent({ ...template.content, ...draft.data.content }, template.content)
            : template.content,
        }
      : template;

    const sent = await sendTemplatedEmail({
      to: auth.email,
      template: merged,
      firstName: slug === 'welcome' ? 'Admin' : undefined,
    });

    return NextResponse.json({
      ok: true,
      email: sent.to,
      resendId: sent.id,
      message: `Preview enviado para ${sent.to}`,
    });
  } catch (error) {
    logger.error('POST test email template', error, { slug });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao enviar preview' },
      { status: 500 },
    );
  }
}
