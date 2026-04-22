import { getServerSession } from '@/lib/supabase/server-auth';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return <DashboardShell initialUserEmail={session?.user?.email ?? null}>{children}</DashboardShell>;
}
