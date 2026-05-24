import { getServerSession } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { getMatriculatedConcursos } from '@/lib/concursos/entitlements';
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

  const [matriculatedConcursos, userIsPro, proInfo] = session?.user?.id
    ? await Promise.all([
        getMatriculatedConcursos(session.user.id).catch(() => []),
        isUserPro(session.user.id).catch(() => false),
        getActiveProInfoForUser(session.user.id).catch(() => ({
          proSource: null as ProSource,
          proExpiresAt: null,
        })),
      ])
    : [[], false, { proSource: null as ProSource, proExpiresAt: null }];

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
      }))}
    >
      {children}
    </DashboardShell>
  );
}
