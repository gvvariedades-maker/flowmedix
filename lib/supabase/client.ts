import { createBrowserClient } from '@supabase/ssr';
import { isInvalidRefreshAuthError } from '@/lib/supabase/authRefreshErrors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

let authRecoveryRegistered = false;

function registerAuthInvalidRefreshRecovery() {
  if (authRecoveryRegistered || typeof window === 'undefined') return;
  authRecoveryRegistered = true;

  const localSignOutIfRefreshInvalid = async (err: unknown) => {
    if (!isInvalidRefreshAuthError(err)) return;
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* evita loop */
    }
  };

  void supabase.auth.getUser().then(({ error }) => void localSignOutIfRefreshInvalid(error));

  const onUnhandled = (e: PromiseRejectionEvent) => {
    if (!isInvalidRefreshAuthError(e.reason)) return;
    e.preventDefault();
    void localSignOutIfRefreshInvalid(e.reason);
  };
  window.addEventListener('unhandledrejection', onUnhandled);
}

registerAuthInvalidRefreshRecovery();
