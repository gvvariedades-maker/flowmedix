import type { AuthError, User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const PER_PAGE = 1000;
/** Limite de páginas para evitar loop infinito (1M usuários no pior caso teórico). */
const MAX_PAGES = 500;

/**
 * Localiza um usuário do Auth pelo e-mail usando apenas a API admin tipada (`listUsers`).
 * O GoTrue Admin não expõe `getUserByEmail` no cliente JS atual; a listagem é paginada.
 * Para bases muito grandes, avalie índice/consulta direta em `auth.users` ou Edge Function.
 */
export async function findAuthUserByEmail(
  adminSupabase: SupabaseClient,
  email: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const normalized = email.toLowerCase().trim();
  let page = 1;

  while (page <= MAX_PAGES) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (error) {
      return { user: null, error };
    }

    const users = data.users;
    const found = users.find((u) => u.email?.toLowerCase() === normalized);
    if (found) {
      return { user: found, error: null };
    }

    if (users.length < PER_PAGE) {
      break;
    }
    page += 1;
  }

  return { user: null, error: null };
}
