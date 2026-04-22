import { supabase } from '@/lib/supabase/client';

/**
 * `fetch` para rotas `/api` autenticadas: envia `Authorization: Bearer <access_token>`
 * para o servidor validar com `getUser(jwt)` sem disparar refresh no Node.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
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
