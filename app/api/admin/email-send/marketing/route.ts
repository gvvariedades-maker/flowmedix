import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { sendMarketingCampaign } from '@/lib/email/marketingSend';
import { getResendServerConfig } from '@/lib/env';
import { MarketingEmailSendSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  if (!getResendServerConfig()) {
    return NextResponse.json(
      { error: 'Resend não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL)' },
      { status: 503 },
    );
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
    const result = await sendMarketingCampaign(auth.admin, parsed.data, auth.email);
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
