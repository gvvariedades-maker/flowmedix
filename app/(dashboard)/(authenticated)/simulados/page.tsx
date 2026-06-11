import { redirect } from 'next/navigation';
import { SimuladosListClient } from '@/components/simulados/SimuladosListClient';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { loadSimuladosHubData } from '@/lib/simulado/hubLoad';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';

export default async function SimuladosPage() {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

  if (!e2eBypass) {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');

    let hub: Awaited<ReturnType<typeof loadSimuladosHubData>>;
    try {
      const supabase = await createSupabaseServerClient();
      hub = await loadSimuladosHubData(supabase, session.user.id);
    } catch (error) {
      logger.error('Failed to load simulados hub', error);
      return (
        <div className="flex min-h-full items-center justify-center bg-background p-6">
          <p className="text-sm text-slate-600">Erro ao carregar simulados. Tente novamente.</p>
        </div>
      );
    }

    return (
      <SimuladosListClient
        openSession={hub.openSession}
        recentSessions={hub.recentSessions}
      />
    );
  }

  return <SimuladosListClient openSession={null} recentSessions={[]} />;
}
