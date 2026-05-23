import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';

/** Usuário autenticado via Bearer (preferido) ou sessão em cookie. */
export async function getRequestUserId(request: NextRequest): Promise<string | null> {
  const bearer = await getUserAndClientFromBearer(request);
  if (bearer) return bearer.user.id;

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

  return session?.user?.id ?? null;
}
