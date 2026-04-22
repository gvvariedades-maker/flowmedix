import { cache } from 'react';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { readSessionFromCookies } from '@/lib/supabase/read-session-from-cookies';

/**
 * Cliente Supabase (anon) para Server Components com dedupe por request.
 *
 * `getServerSession()` **não** usa `supabase.auth.getSession()` no RSC: essa
 * chamada pode disparar refresh no Node e competir com `getUser()` do
 * `proxy.ts` (mesmo refresh_token) → `Invalid Refresh Token: Already Used`.
 * A sessão para UI/redirect vem só da leitura dos cookies em
 * `readSessionFromCookies` (sem rede).
 *
 * `createSupabaseServerClient` continua disponível para queries com
 * `autoRefreshToken: false` no SDK SSR.
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
 * Retorna a `session` atual (só leitura de cookie) — deduplicada por request.
 */
export const getServerSession = cache(async () => {
  const cookieStore = await cookies();
  return readSessionFromCookies(cookieStore, process.env.NEXT_PUBLIC_SUPABASE_URL!);
});
