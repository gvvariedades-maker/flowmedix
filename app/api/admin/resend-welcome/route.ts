import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';
import { getResendServerConfig } from '@/lib/env';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';

const BodySchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine((d) => d.userId || d.email, { message: 'Informe userId ou email' });

/** Admin: reenvia e-mail de boas-vindas (Resend). */
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

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 422 });
  }

  let userId = parsed.data.userId;
  if (!userId && parsed.data.email) {
    const { user, error } = await findAuthUserByEmail(auth.admin, parsed.data.email);
    if (error || !user?.id) {
      return NextResponse.json({ error: 'Usuário não encontrado para este e-mail' }, { status: 404 });
    }
    userId = user.id;
  }

  const result = await sendWelcomeEmail(userId!);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, sent: false, error: result.error ?? 'Falha ao enviar' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    userId,
    email: result.email,
    resendId: result.resendId ?? null,
    sentAt: new Date().toISOString(),
    message: `E-mail de boas-vindas enviado para ${result.email}.`,
  });
}
