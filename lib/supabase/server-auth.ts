import { cache } from 'react';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Helpers de auth no servidor (RSC e Route Handlers).
 *
 * ## Dois modos — não confundir semântica
 *
 * | Função | Mecanismo | Uso |
 * |--------|-----------|-----|
 * | `getServerSession()` | `getSession()` — lê JWT do cookie local | Identidade em RSC **após** o `proxy.ts` (`userId`, UI). **Não** autorização. |
 * | `getServerUser()` | `getUser()` — valida JWT no Auth server | Gates de privilégio (layout admin, authZ). |
 *
 * JWT revogado pode ainda existir no cookie enquanto `getSession()` retorna sessão;
 * só `getUser()` detecta revogação. Por isso **nunca** use `getServerSession()`
 * para decidir acesso admin ou service role.
 *
 * Rotas `/api/admin/*`: preferir `requireAdminApi()` (`lib/admin/requireAdmin.ts`),
 * que combina `getUser()` + whitelist de e-mail + cliente service role.
 *
 * Dashboard: o `proxy.ts` já chama `getUser()` na borda; RSC do dashboard continuam
 * com `getServerSession()` (read-only) para evitar refresh duplo no Node.
 *
 * `createServerClient` do `@supabase/ssr` força `autoRefreshToken: false` — leitura
 * vem do storage (cookies) **sem** refresh no Node, evitando competir com
 * `getUser()` do `proxy.ts` (mesmo refresh_token) → `Invalid Refresh Token: Already Used`.
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
 * Sessão atual via leitura de cookie (`getSession()`) — deduplicada por request.
 *
 * **Cookie read, não authZ.** O JWT pode estar revogado no Auth server enquanto o
 * cookie local ainda existe; esta função não detecta revogação.
 *
 * Use após o `proxy.ts` em RSC do dashboard para identidade leve (ex.: `userId`,
 * render condicional). Para gates de privilégio ou `/api/admin/*`, use
 * `getServerUser()` ou `requireAdminApi()`.
 */
export const getServerSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

/**
 * Usuário validado no Auth server (`getUser()`) — deduplicado por request.
 *
 * **AuthZ:** JWT verificado remotamente; use para gates de privilégio (ex.: layout
 * admin, `session-is-admin`). Em rotas `/api/admin/*`, prefira `requireAdminApi()`
 * (retorna também service role + e-mail normalizado).
 *
 * Dashboard RSC: o `proxy.ts` já valida na borda; aqui só é necessário quando a
 * rota exige confirmação server-side extra (ex.: `/admin`).
 */
export const getServerUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
