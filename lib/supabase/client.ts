import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Cliente Supabase do browser — **único ponto** que executa refresh de token
 * em toda a aplicação. O SDK usa a Web Locks API internamente, garantindo que
 * apenas um refresh rode por vez entre todas as abas do mesmo origin.
 *
 * IMPORTANTE: não criar outros `createBrowserClient` pela app. `@supabase/ssr`
 * tem singleton global, mas duplicar aqui com opções diferentes gera corridas
 * de refresh_token (AuthApiError: Invalid Refresh Token: Already Used).
 *
 * O `proxy.ts` chama `getUser()` (pode renovar tokens antes do RSC). Os Server
 * Components leem a sessão só dos cookies (`getServerSession`), sem refresh no
 * Node. O refresh contínuo no client fica neste singleton (Web Locks entre abas).
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
