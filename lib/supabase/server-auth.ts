import { cache } from 'react';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase (anon) para Server Components com dedupe por request.
 *
 * `getServerSession()` usa `createServerClient` + `getSession()`. O
 * `createServerClient` do `@supabase/ssr` força `autoRefreshToken: false` — a
 * leitura vem do storage (cookies) **sem** refresh no Node, evitando competir
 * com `getUser()` do `proxy.ts` (mesmo refresh_token) →
 * `Invalid Refresh Token: Already Used`.
 */

const cookiesConfig = (cookieStore: Awaited<ReturnType<typeof cookies>>) => ({
  getAll() {
    return cookieStore.getAll();
  },
  setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
    try {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options),
      );
    } catch {
      // Em alguns contextos RSC `set` não está disponível. O próximo request
      // atualizará o cookie via browser client (refresh centralizado lá).
    }
  },
});

export const createSupabaseServerClient = cache(async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookiesConfig(cookieStore),
    },
  );
});

/**
 * Retorna a `session` atual (só leitura de cookie via SDK) — deduplicada por request.
 */
export const getServerSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

/** Usuário validado no Auth (preferir a `session.user` de `getSession()` em rotas protegidas). */
export const getServerUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
