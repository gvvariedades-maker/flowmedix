import { supabase } from '@/lib/supabase/client';

/**
 * E2E/CI: evita `getSession()` contra Supabase placeholder (pode travar o prefetch/nav).
 * Server-side continua validando `E2E_DASHBOARD_BYPASS` nas rotas `/api`.
 */
function shouldUseE2eClientFetch(): boolean {
  return process.env.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS === 'true';
}

/**
 * `fetch` para rotas `/api` autenticadas: envia `Authorization: Bearer <access_token>`
 * para o servidor validar com `getUser(jwt)` sem disparar refresh no Node.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (shouldUseE2eClientFetch()) {
    return fetch(input, {
      ...init,
      credentials: init.credentials ?? 'same-origin',
    });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'same-origin',
  });
}
