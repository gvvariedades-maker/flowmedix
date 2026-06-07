import { NextRequest, NextResponse } from 'next/server';

import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { distributedRateLimit } from '@/lib/rate-limit';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { createServerSupabase } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/supabase/server-auth';
export async function GET(request: NextRequest) {
  try {
    if (!(await distributedRateLimit(request, { key: 'check-user', limit: 20, windowMs: 60_000 }))) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório. Use: /api/check-user?email=seu@email.com' },
        { status: 400 },
      );
    }

    const authUser = await getServerUser();
    const currentUserEmail = authUser?.email ?? null;
    const isCurrentUserLoggedIn = currentUserEmail?.toLowerCase() === email.toLowerCase();
    const isAdmin = isAdminSessionEmail(currentUserEmail);

    let user: { id: string; email?: string; created_at?: string; last_sign_in_at?: string; email_confirmed_at?: string | null } | null = null;
    let userExists = false;

    // Caso 1: Usuário consultando o próprio email - retorna dados da sessão
    if (isCurrentUserLoggedIn && authUser) {
      userExists = true;
      user = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
      };
    }
    // Caso 2: Admin consultando qualquer email - pode usar Admin API
    else if (isAdmin) {
      try {
        const adminSupabase = await createServerSupabase();
        const { user: lookedUpUser, error: userError } = await findAuthUserByEmail(
          adminSupabase,
          email.toLowerCase(),
        );
        if (!userError && lookedUpUser) {
          user = lookedUpUser;          userExists = true;
        }
      } catch (adminError: unknown) {
        logger.warn('Erro ao acessar Admin API', { email, error: adminError instanceof Error ? adminError.message : adminError });
      }
    }
    // Caso 3: Usuário comum consultando outro email - NÃO usar Admin API (evita user enumeration)
    // Retorna exists: false sem revelar se o email existe no sistema

    return NextResponse.json({
      email: email.toLowerCase(),
      exists: userExists,
      isLoggedIn: isCurrentUserLoggedIn,
      currentLoggedInUser: currentUserEmail,
      userInfo: user
        ? {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            lastSignIn: user.last_sign_in_at,
            confirmed: user.email_confirmed_at !== null,
          }
        : null,
      message: isCurrentUserLoggedIn
        ? `✅ O email ${email} está LOGADO no momento.`
        : userExists
        ? `ℹ️ O email ${email} existe no sistema, mas NÃO está logado no momento.`
        : currentUserEmail && !isAdmin
        ? `⚠️ Você só pode verificar seu próprio email. Faça login com ${email} para verificar.`
        : `❌ O email ${email} NÃO está logado ou não foi possível verificar.`,
    });
  } catch (error: unknown) {
    logger.error('Erro inesperado ao verificar usuário', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
