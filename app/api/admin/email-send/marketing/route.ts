import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { sendMarketingCampaign } from '@/lib/email/marketingSend';
import { getResendServerConfig } from '@/lib/env';
import { isAdminSessionEmail } from '@/lib/constants';
import { MarketingEmailSendSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = MarketingEmailSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    );
  }

  try {
    const result = await sendMarketingCampaign(auth.admin, parsed.data, adminEmail);
    return NextResponse.json({
      ...result,
      message:
        result.failed === 0
          ? `${result.sent} e-mail(s) enviado(s).`
          : `${result.sent} enviado(s), ${result.failed} falha(s).`,
    });
  } catch (error) {
    logger.error('POST /api/admin/email-send/marketing', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao enviar campanha' },
      { status: 500 },
    );
  }
}
