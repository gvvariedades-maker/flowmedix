import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { SimuladoRunnerClient } from '@/components/simulados/SimuladoRunnerClient';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { attachConclusaoIncentivos } from '@/lib/simulado/attachConclusaoIncentivos';
import { loadSimuladoSessionDetail } from '@/lib/simulado/sessionDetail';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

export default async function SimuladoSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsed = SessionIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  const sessionId = parsed.data;
  const e2e = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

  let supabase = null;
  let userId: string | undefined;

  if (!e2e) {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');
    supabase = await createSupabaseServerClient();
    userId = session.user.id;
  }

  const result = await loadSimuladoSessionDetail(supabase, userId, sessionId);

  if (result.error === 'not_found') notFound();
  if (result.error === 'db') {
    throw new Error('Erro ao carregar simulado no servidor');
  }

  let sessionDetail = result.data;
  if (!e2e && supabase && userId && sessionDetail.session.status === 'concluido') {
    sessionDetail = await attachConclusaoIncentivos(supabase, userId, sessionDetail);
  }

  return <SimuladoRunnerClient sessionId={sessionId} initialSession={sessionDetail} />;
}
