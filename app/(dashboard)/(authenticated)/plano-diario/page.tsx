import { redirect } from 'next/navigation';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { shouldUseFsrsTodayQueue } from '@/lib/fsrs/reviewsToday';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { getServerSession } from '@/lib/supabase/server-auth';
import PlanoDiarioClient from './PlanoDiarioClient';

const LIMITE_DIARIO = 10;

export default async function PlanoDiarioPage() {
  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    return <PlanoDiarioClient revisoes={[]} totalPendentes={0} limite={LIMITE_DIARIO} />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  // AVANT Memória ativo → rota canônica `/revisoes-hoje`. O SM-2 abaixo permanece
  // apenas como caminho legado/rollback, invisível para quem tem a superfície nova.
  if (shouldUseFsrsTodayQueue(session.user.email)) {
    redirect('/revisoes-hoje');
  }

  const userId = session.user.id;

  // Busca todas as revisões vencidas, ordena por prioridade e limita a 10
  const todasRevisoes = await getTodayReviews(userId);
  const total = todasRevisoes.length;
  const revisoesDoDia = todasRevisoes.slice(0, LIMITE_DIARIO);

  return (
    <PlanoDiarioClient
      revisoes={revisoesDoDia}
      totalPendentes={total}
      limite={LIMITE_DIARIO}
    />
  );
}
