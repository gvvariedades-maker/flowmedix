import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminSessionEmail } from '@/lib/constants';

type RequireAdminApiError = { error: NextResponse };
type RequireAdminApiSuccess = {
  admin: Awaited<ReturnType<typeof createServerSupabase>>;
  user: User;
  email: string;
};

export type RequireAdminApiResult = RequireAdminApiError | RequireAdminApiSuccess;

/**
 * Autoriza rotas `/api/admin/*` via `getUser()` no Auth server (JWT validado).
 * Retorna cliente service role + usuário autenticado para evitar `getSession()` duplicado.
 */
export async function requireAdminApi(): Promise<RequireAdminApiResult> {
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
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }

  const email = user.email.toLowerCase();
  if (!isAdminSessionEmail(email)) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
  }

  return { admin: await createServerSupabase(), user, email };
}
