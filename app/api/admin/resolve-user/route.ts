import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { ResolveUserSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn('Invalid JSON payload in resolve-user');
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const validationResult = ResolveUserSchema.safeParse(body);
  if (!validationResult.success) {
    logger.warn('Validation failed for resolve-user', { errors: validationResult.error.issues });
    return NextResponse.json(
      { error: 'Dados inválidos', details: validationResult.error.issues },
      { status: 400 }
    );
  }

  const { email: targetEmail } = validationResult.data;

  const { user, error } = await findAuthUserByEmail(auth.admin, targetEmail);

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
