import { redirect } from 'next/navigation';
import { AdminToastShell } from '@/components/admin/AdminToastShell';
import { getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

const bypassEnabled = isE2eBypassEnabled('E2E_ADMIN_BYPASS');

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!bypassEnabled) {
    const user = await getServerUser();

    if (!user?.email) {
      redirect('/login');
    }

    if (!isAdminSessionEmail(user.email)) {
      redirect('/');
    }
  }

  return (
    <AdminToastShell>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
        {children}
      </div>
    </AdminToastShell>
  );
}