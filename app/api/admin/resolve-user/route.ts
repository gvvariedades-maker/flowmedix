import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAdminEmail } from '@/lib/constants';
import { ResolveUserSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O Next já lida com cookies no Server Component
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Acesso não autenticado' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (email !== getAdminEmail()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn('Invalid JSON payload in resolve-user');
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // Validação com Zod
  const validationResult = ResolveUserSchema.safeParse(body);
  if (!validationResult.success) {
    logger.warn('Validation failed for resolve-user', { errors: validationResult.error.issues });
    return NextResponse.json(
      { error: 'Dados inválidos', details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const { email: targetEmail } = validationResult.data;

  const adminSupabase = await createServerSupabase();
  const { data: user, error } = await adminSupabase.auth.admin.getUserByEmail(targetEmail);

  if (error) {
    logger.error('Database error resolving user', error, { email: targetEmail });
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }

  if (!user) {
    logger.warn('User not found', { email: targetEmail });
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  logger.info('User resolved successfully', { userId: user.id });
  return NextResponse.json({ userId: user.id });
}









