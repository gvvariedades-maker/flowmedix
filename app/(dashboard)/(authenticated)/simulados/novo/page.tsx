import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase/server-auth';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { SimuladosSetupClient } from '@/components/simulados/SimuladosSetupClient';

export default async function SimuladosNovoPage() {
  if (!isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');
  }

  return <SimuladosSetupClient />;
}
