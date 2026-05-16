import { randomBytes } from 'node:crypto';
import type { AuthError, User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const PER_PAGE = 1000;
/** Limite de páginas para evitar loop infinito (1M usuários no pior caso teórico). */
const MAX_PAGES = 500;

const RPC_FIND_USER_BY_EMAIL = 'admin_get_auth_user_id_by_email';

/**
 * Busca id em auth.users via RPC (service role). Evita listUsers quando há NULLs em colunas do Auth.
 */
async function findAuthUserIdByEmailRpc(
  adminSupabase: SupabaseClient,
  normalizedEmail: string,
): Promise<string | null> {
  const { data, error } = await adminSupabase.rpc(RPC_FIND_USER_BY_EMAIL, {
    user_email: normalizedEmail,
  });

  if (error) {
    logger.warn('RPC admin_get_auth_user_id_by_email falhou', {
      message: error.message,
      code: error.code,
    });
    return null;
  }

  return typeof data === 'string' ? data : null;
}

/**
 * Fallback: listUsers paginado (pode falhar se auth.users tiver dados incompatíveis com GoTrue).
 */
async function findAuthUserByEmailListUsers(
  adminSupabase: SupabaseClient,
  normalized: string,
): Promise<{ user: User | null; error: AuthError | null }> {
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

/**
 * Localiza um usuário do Auth pelo e-mail (RPC em auth.users; fallback listUsers).
 */
export async function findAuthUserByEmail(
  adminSupabase: SupabaseClient,
  email: string,
): Promise<{ user: User | null; error: AuthError | null }> {
  const normalized = email.toLowerCase().trim();
  const userId = await findAuthUserIdByEmailRpc(adminSupabase, normalized);

  if (userId) {
    return { user: { id: userId, email: normalized } as User, error: null };
  }

  return findAuthUserByEmailListUsers(adminSupabase, normalized);
}

/**
 * Garante usuário no Auth pelo e-mail. Se não existir, cria com e-mail confirmado e senha aleatória
 * (o aluno define a senha em /esqueci-senha).
 */
export async function findOrCreateAuthUserByEmail(
  adminSupabase: SupabaseClient,
  email: string,
  displayName: string | null = null,
): Promise<{ userId: string; created: boolean }> {
  const normalized = email.toLowerCase().trim();
  const existingId = await findAuthUserIdByEmailRpc(adminSupabase, normalized);

  if (existingId) {
    return { userId: existingId, created: false };
  }

  const password = randomBytes(32).toString('base64url');
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
    user_metadata: displayName ? { full_name: displayName } : undefined,
  });

  if (error) {
    const alreadyExists =
      error.message?.toLowerCase().includes('already') ||
      error.message?.toLowerCase().includes('registered') ||
      error.status === 422;

    if (alreadyExists) {
      const retryId = await findAuthUserIdByEmailRpc(adminSupabase, normalized);
      if (retryId) {
        return { userId: retryId, created: false };
      }
    }

    logger.error('Falha ao criar usuário Auth (admin)', error, { email: normalized });
    throw error;
  }

  if (!data.user?.id) {
    throw new Error('createUser sem retorno de usuário');
  }

  return { userId: data.user.id, created: true };
}
