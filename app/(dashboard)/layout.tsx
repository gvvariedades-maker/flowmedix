import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  ensureGeralCadastroMatricula,
  getMatriculatedConcursos,
  userHasActiveMatricula,
} from '@/lib/concursos/entitlements';
import { isUserPro } from '@/lib/freemium';
import { logger } from '@/lib/logger';
import DashboardShell from './DashboardShell';

function displayNameFromSessionUser(
  user: { user_metadata?: Record<string, unknown> } | null | undefined,
): string | null {
  if (!user?.user_metadata) return null;
  const m = user.user_metadata;
  const fromFull = m.full_name;
  const fromName = m.name;
  if (typeof fromFull === 'string' && fromFull.trim()) return fromFull.trim();
  if (typeof fromName === 'string' && fromName.trim()) return fromName.trim();
  return null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const email = session?.user?.email ?? null;
  const isAdmin = isAdminSessionEmail(email);

  if (session?.user?.id && !isAdmin) {
    let hasActiveMatricula = await userHasActiveMatricula(session.user.id).catch(() => false);
    if (!hasActiveMatricula) {
      await ensureGeralCadastroMatricula(session.user.id).catch((error) => {
        logger.warn('Falha ao garantir matrícula geral (free)', {
          userId: session.user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
      hasActiveMatricula = await userHasActiveMatricula(session.user.id).catch(() => false);
    }
    if (!hasActiveMatricula) {
      redirect('/planos');
    }
  }

  const [matriculatedConcursos, userIsPro] = session?.user?.id
    ? await Promise.all([
        getMatriculatedConcursos(session.user.id).catch(() => []),
        isUserPro(session.user.id).catch(() => false),
      ])
    : [[], false];

  const isPro = isAdmin || userIsPro;

  return (
    <DashboardShell
      initialUserEmail={email}
      initialDisplayName={displayNameFromSessionUser(session?.user ?? null)}
      initialIsAdmin={isAdmin}
      isPro={isPro}
      initialMatriculatedConcursos={matriculatedConcursos.map((concurso) => ({
        slug: concurso.slug,
        nome: concurso.nome,
        tipo: concurso.tipo,
      }))}
    >
      {children}
    </DashboardShell>
  );
}
