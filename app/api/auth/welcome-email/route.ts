import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sendWelcomeEmail } from '@/lib/actions/email-actions';
import { getResendServerConfig } from '@/lib/env';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const FreshSignupBodySchema = z.object({
  userId: z.string().uuid(),
});

const FRESH_SIGNUP_WINDOW_MS = 15 * 60 * 1000;

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
    return NextResponse.json({ sent: false, error: result.error ?? 'Falha ao enviar e-mail' }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}

/**
 * Dispara e-mail de boas-vindas após cadastro.
 * - Com sessão: usa o usuário logado.
 * - Sem sessão (confirmação por e-mail pendente): aceita userId de signup recente (< 15 min).
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return sendWelcomeForUser(session.user.id);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const parsed = FreshSignupBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'userId inválido' }, { status: 400 });
  }

  const admin = await createServerSupabase();
  const { data: authData, error: authError } = await admin.auth.admin.getUserById(parsed.data.userId);

  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const createdAt = authData.user.created_at ? new Date(authData.user.created_at).getTime() : 0;
  if (!createdAt || Date.now() - createdAt > FRESH_SIGNUP_WINDOW_MS) {
    return NextResponse.json({ error: 'Cadastro fora da janela para envio automático' }, { status: 403 });
  }

  return sendWelcomeForUser(parsed.data.userId);
}
