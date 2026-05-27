import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { getServerSession } from '@/lib/supabase/server-auth';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { SimuladoRunnerClient } from '@/components/simulados/SimuladoRunnerClient';

const SessionIdSchema = z.string().uuid('ID de sessão inválido');

export default async function SimuladoSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');
  }

  const { id } = await params;
  const parsed = SessionIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  return <SimuladoRunnerClient sessionId={parsed.data} />;
}
