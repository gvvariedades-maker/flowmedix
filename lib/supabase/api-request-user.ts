import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type ApiUserAuthOk = { user: User; supabase: SupabaseClient };

/**
 * Autenticação para Route Handlers **sem** `auth.getSession()` no servidor.
 *
 * `getSession()` no servidor pode disparar refresh em paralelo com o browser
 * → `Invalid Refresh Token: Already Used` e 400 no cliente.
 *
 * O client envia `Authorization: Bearer <access_token>`; usamos
 * `getUser(accessToken)` que valida o JWT **sem** fluxo de refresh.
 * O `createClient` com o mesmo header faz o PostgREST aplicar RLS com `auth.uid()`.
 */
export async function getUserAndClientFromBearer(
  request: NextRequest,
): Promise<ApiUserAuthOk | null> {
  const header = request.headers.get('authorization');
  const accessToken =
    header?.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;

  if (!accessToken) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) return null;

  return { user, supabase };
}
