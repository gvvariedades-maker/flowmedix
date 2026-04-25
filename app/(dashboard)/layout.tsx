import { getServerSession } from '@/lib/supabase/server-auth';
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

  return (
    <DashboardShell
      initialUserEmail={session?.user?.email ?? null}
      initialDisplayName={displayNameFromSessionUser(session?.user ?? null)}
    >
      {children}
    </DashboardShell>
  );
}
