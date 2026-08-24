import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AdminToastShell } from '@/components/admin/AdminToastShell';
import { getServerUser, createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getAdminAssuranceLevel, type AdminMfaAssuranceState } from '@/lib/admin/adminAssurance';
import { resolveAdminLayoutRedirect } from '@/lib/admin/adminLayoutGuard';

const bypassEnabled = isE2eBypassEnabled('E2E_ADMIN_BYPASS');

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!bypassEnabled) {
    const user = await getServerUser();
    const isAdmin = isAdminSessionEmail(user?.email);

    let assuranceState: AdminMfaAssuranceState = 'FAIL_CLOSED';
    if (user?.email && isAdmin) {
      const supabase = await createSupabaseServerClient();
      const assurance = await getAdminAssuranceLevel(supabase);
      assuranceState = assurance.state;
    }

    const headerList = await headers();
    const currentPath = headerList.get('x-pathname');

    const destination = resolveAdminLayoutRedirect({
      user,
      isAdmin,
      assuranceState,
      currentPath,
      bypassEnabled,
    });

    if (destination) {
      redirect(destination);
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