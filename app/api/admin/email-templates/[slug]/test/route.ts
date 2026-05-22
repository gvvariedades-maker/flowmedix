import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { getEmailTemplateBySlug, sendTemplatedEmail } from '@/lib/email/templates';
import { getResendServerConfig } from '@/lib/env';
import { isAdminSessionEmail } from '@/lib/constants';
import { EmailTemplateUpdateSchema } from '@/lib/validations';
import { mergeEmailContent } from '@/lib/email/templateContent';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ slug: string }> };

async function adminSessionEmail(): Promise<string | null> {
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
  return email && isAdminSessionEmail(email) ? email : null;
}

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

  const adminEmail = await adminSessionEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Sessão admin inválida' }, { status: 401 });
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
      to: adminEmail,
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
