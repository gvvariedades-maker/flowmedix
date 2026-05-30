import { redirect } from 'next/navigation';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { getServerSession } from '@/lib/supabase/server-auth';
import PlanoDiarioClient from './PlanoDiarioClient';

const LIMITE_DIARIO = 10;

export default async function PlanoDiarioPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

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
