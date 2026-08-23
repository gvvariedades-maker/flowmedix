import { getServerSession, getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  ensureGeralCadastroMatricula,
  userHasActiveMatricula,
} from '@/lib/concursos/entitlements';
import type { MatriculaReadOptions } from '@/lib/concursos/matriculaRequestSnapshot';
import { logger } from '@/lib/logger';

export type DashboardAuthDecision =
  | { type: 'ok' }
  | { type: 'redirect'; to: '/login' | '/planos' };

type AuthUser = { id: string; email?: string | null };
type AuthSession = { user?: { id?: string } | null } | null;

export type AuthenticatedDashboardAccessDeps = {
  getServerUser: () => Promise<AuthUser | null>;
  getServerSession: () => Promise<AuthSession>;
  userHasActiveMatricula: (
    userId: string,
    concursoId?: string,
    options?: MatriculaReadOptions,
  ) => Promise<boolean>;
  ensureGeralCadastroMatricula: (userId: string) => Promise<unknown>;
  isAdminSessionEmail: (email: string | null | undefined) => boolean;
};

const defaultDeps: AuthenticatedDashboardAccessDeps = {
  getServerUser: async () => getServerUser(),
  getServerSession,
  userHasActiveMatricula,
  ensureGeralCadastroMatricula,
  isAdminSessionEmail,
};

/**
 * Gate do dashboard autenticado.
 *
 * `getServerUser()` autoriza (JWT validado). Cookie/`getServerSession()` só dispara
 * a leitura de matrícula em paralelo. Sessão revogada nunca entra pelo cookie.
 */
export async function decideAuthenticatedDashboardAccess(
  deps: Partial<AuthenticatedDashboardAccessDeps> = {},
): Promise<DashboardAuthDecision> {
  const resolved: AuthenticatedDashboardAccessDeps = { ...defaultDeps, ...deps };

  const userPromise = resolved.getServerUser();
  const sessionPromise = resolved.getServerSession();

  const session = await sessionPromise;
  const sessionUserId = session?.user?.id ?? null;
  const parallelMatriculaPromise = sessionUserId
    ? resolved.userHasActiveMatricula(sessionUserId).catch(() => false)
    : null;

  const user = await userPromise;
  if (!user?.id) {
    if (parallelMatriculaPromise) await parallelMatriculaPromise;
    return { type: 'redirect', to: '/login' };
  }

  if (resolved.isAdminSessionEmail(user.email ?? null)) {
    if (parallelMatriculaPromise) await parallelMatriculaPromise;
    return { type: 'ok' };
  }

  let hasActiveMatricula: boolean;
  if (parallelMatriculaPromise && sessionUserId === user.id) {
    hasActiveMatricula = await parallelMatriculaPromise;
  } else {
    if (parallelMatriculaPromise) await parallelMatriculaPromise;
    hasActiveMatricula = await resolved.userHasActiveMatricula(user.id).catch(() => false);
  }

  if (!hasActiveMatricula) {
    try {
      await resolved.ensureGeralCadastroMatricula(user.id);
    } catch (error) {
      logger.warn('Falha ao garantir matrícula geral (free)', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    hasActiveMatricula = await resolved
      .userHasActiveMatricula(user.id, undefined, { fresh: true })
      .catch(() => false);
  }

  if (!hasActiveMatricula) {
    return { type: 'redirect', to: '/planos' };
  }

  return { type: 'ok' };
}
