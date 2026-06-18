import { getServerSession } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import {
  EMPTY_NOTEBOOK_ACTIVATION,
  getMatriculatedConcursosCached,
  getNotebookActivationCached,
  getUserPreferencesOnboardingCached,
} from '@/lib/cache';
import { getActiveProInfoForUser, isUserPro, type ProSource } from '@/lib/freemium';
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

  const [matriculatedConcursos, userIsPro, proInfo, notebookActivation, onboardingPreferences] =
    session?.user?.id
    ? await Promise.all([
        getMatriculatedConcursosCached(session.user.id).catch(() => []),
        isUserPro(session.user.id).catch(() => false),
        getActiveProInfoForUser(session.user.id).catch(() => ({
          proSource: null as ProSource,
          proExpiresAt: null,
        })),
        getNotebookActivationCached(session.user.id).catch(() => EMPTY_NOTEBOOK_ACTIVATION),
        getUserPreferencesOnboardingCached(session.user.id).catch(() => ({
          completed: false,
          preferences: null,
        })),
      ])
    : [
        [],
        false,
        { proSource: null as ProSource, proExpiresAt: null },
        EMPTY_NOTEBOOK_ACTIVATION,
        { completed: false, preferences: null },
      ];

  const isPro = isAdmin || userIsPro;

  return (
    <DashboardShell
      initialUserEmail={email}
      initialDisplayName={displayNameFromSessionUser(session?.user ?? null)}
      initialIsAdmin={isAdmin}
      isPro={isPro}
      proSource={isPro && !isAdmin ? proInfo.proSource : null}
      proExpiresAt={isPro && !isAdmin ? proInfo.proExpiresAt : null}
      initialMatriculatedConcursos={matriculatedConcursos.map((concurso) => ({
        slug: concurso.slug,
        nome: concurso.nome,
        tipo: concurso.tipo,
        banca: concurso.banca,
        orgao: concurso.orgao,
        ano: concurso.ano,
      }))}
      initialNotebookActivation={notebookActivation}
      initialOnboardingCompleted={onboardingPreferences.completed}
    >
      {children}
    </DashboardShell>
  );
}
