import { NextResponse } from 'next/server';

import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';
import { getResendServerConfig } from '@/lib/env';
import { logger } from '@/lib/logger';
import { distributedRateLimit } from '@/lib/rate-limit';
import { getServerUser } from '@/lib/supabase/server-auth';

export const runtime = 'nodejs';

async function sendWelcomeForUser(userId: string) {
  if (!getResendServerConfig()) {
    logger.warn('welcome-email: Resend não configurado no servidor', { userId });
    return NextResponse.json(
      {
        sent: false,
        error:
          'Serviço de e-mail não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL na Vercel).',
      },
      { status: 503 },
    );
  }

  const result = await sendWelcomeEmail(userId);
  if (!result.success) {
    logger.error('welcome-email: falha ao enviar', undefined, { userId, error: result.error });
    return NextResponse.json(
      { ok: false, sent: false, error: result.error ?? 'Falha ao enviar e-mail' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    email: result.email,
    resendId: result.resendId ?? null,
    sentAt: new Date().toISOString(),
    message: `E-mail de boas-vindas enviado para ${result.email}.`,
  });
}

/**
 * Dispara e-mail de boas-vindas após cadastro com sessão ativa (signup imediato).
 * Cadastros com confirmação por e-mail: webhook Supabase `auth.users` INSERT → `/api/webhooks/auth`.
 */
export async function POST(request: Request) {
  if (!(await distributedRateLimit(request, { key: 'welcome-email', limit: 5, windowMs: 60_000 }))) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
      { status: 429 },
    );
  }

  const user = await getServerUser();

  if (!user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  return sendWelcomeForUser(user.id);
}
