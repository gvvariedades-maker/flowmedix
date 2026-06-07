import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  ensureGeralCadastroMatricula,
  userHasActiveMatricula,
} from '@/lib/concursos/entitlements';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

const dashboardBypassEnabled = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (dashboardBypassEnabled) {
    return children;
  }

  const user = await getServerUser();

  if (!user?.id) {
    redirect('/login');
  }

  const isAdmin = isAdminSessionEmail(user.email ?? null);

  if (!isAdmin) {
    let hasActiveMatricula = await userHasActiveMatricula(user.id).catch(() => false);
    if (!hasActiveMatricula) {
      await ensureGeralCadastroMatricula(user.id).catch((error) => {
        logger.warn('Falha ao garantir matrícula geral (free)', {
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
      hasActiveMatricula = await userHasActiveMatricula(user.id).catch(() => false);
    }
    if (!hasActiveMatricula) {
      redirect('/planos');
    }
  }

  return children;
}
