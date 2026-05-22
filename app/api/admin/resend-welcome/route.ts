import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';
import { isAdminSessionEmail } from '@/lib/constants';
import { getResendServerConfig } from '@/lib/env';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { createServerSupabase } from '@/lib/supabase/server';

const BodySchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine((d) => d.userId || d.email, { message: 'Informe userId ou email' });

async function requireAdmin() {
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
  if (!email) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  if (!isAdminSessionEmail(email)) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
  }

  return { admin: await createServerSupabase() };
}

/** Admin: reenvia e-mail de boas-vindas (Resend). */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
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
