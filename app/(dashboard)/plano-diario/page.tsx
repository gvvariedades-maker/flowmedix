import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTodayReviews } from '@/lib/spaced-repetition';
import PlanoDiarioClient from './PlanoDiarioClient';

const LIMITE_DIARIO = 10;

export default async function PlanoDiarioPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
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
