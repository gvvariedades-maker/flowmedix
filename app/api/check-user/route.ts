import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getAdminEmail } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório. Use: /api/check-user?email=seu@email.com' },
        { status: 400 }
      );
    }

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
              // Next.js já cuida dos cookies em Server Components
            }
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const currentUserEmail = session?.user?.email || null;
    const isCurrentUserLoggedIn = currentUserEmail?.toLowerCase() === email.toLowerCase();
    const isAdmin = currentUserEmail?.toLowerCase() === getAdminEmail();

    let user: { id: string; email?: string; created_at?: string; last_sign_in_at?: string; email_confirmed_at?: string | null } | null = null;
    let userExists = false;

    // Caso 1: Usuário consultando o próprio email - retorna dados da sessão
    if (isCurrentUserLoggedIn && session?.user) {
      userExists = true;
      user = {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at,
        email_confirmed_at: session.user.email_confirmed_at,
      };
    }
    // Caso 2: Admin consultando qualquer email - pode usar Admin API
    else if (isAdmin) {
      try {
        const adminSupabase = await createServerSupabase();
        if (adminSupabase.auth.admin?.getUserByEmail) {
          const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserByEmail(
            email.toLowerCase()
          );
          if (!userError && userData?.user) {
            user = userData.user;
            userExists = true;
          }
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
  } catch (error: any) {
    logger.error('Erro inesperado ao verificar usuário', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
