import { redirect } from 'next/navigation';
import { AdminToastShell } from '@/components/admin/AdminToastShell';
import { getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';

/**
 * Bypass server-only para E2E: ignora auth no AdminLayout quando
 * E2E_ADMIN_BYPASS=true e (dev local ou CI). Em produção real (NODE_ENV=production
 * sem CI) o bypass nunca ativa, mesmo com a variável setada por engano.
 */
const bypassEnabled =
  process.env.E2E_ADMIN_BYPASS === 'true' &&
  (process.env.NODE_ENV !== 'production' || process.env.CI === 'true');

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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </div>
    </AdminToastShell>
  );
}