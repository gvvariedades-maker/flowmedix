import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { ProgressoEstudoDashboard } from '@/components/dashboard/progresso/ProgressoEstudoDashboard';
import type { AssuntoTop, DesempenhoData, DiaEstudo } from '@/components/dashboard/progresso/ProgressoEstudoDashboard';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';

export type { AssuntoTop, DesempenhoData, DiaEstudo } from '@/components/dashboard/progresso/ProgressoEstudoDashboard';

const META_DIARIA = 10;

export default async function ProgressoPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const userId = session.user.id;

  const supabase = await createSupabaseServerClient();

  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    const [{ count: totalHistorico, error: errorTotal }, { data, error }] = await Promise.all([
      supabase
        .from('historico_questoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('estudo_reverso_concluido', true),
      supabase
        .from('historico_questoes')
        .select('created_at, subtopico, topico, modulo_slug')
        .eq('user_id', userId)
        .eq('estudo_reverso_concluido', true)
        .gte('created_at', desde.toISOString())
        .order('created_at', { ascending: false }),
    ]);

    if (errorTotal) {
      logger.error('Failed to fetch total count for progresso-estudo', errorTotal, { userId });
    }
    if (error) {
      logger.error('Failed to fetch history for progresso-estudo', error, { userId });
      throw error;
    }

    const registros = (data || []) as any[];
    const totalTodosTempos = totalHistorico ?? 0;

    const toDateStr = (iso: string) => iso.slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const hoje = registros.filter((r) => toDateStr(r.created_at) === todayStr).length;
    const totalGeral = registros.length;

    const countByDay = new Map<string, number>();
    registros.forEach((r) => {
      const d = toDateStr(r.created_at);
      countByDay.set(d, (countByDay.get(d) || 0) + 1);
    });

    const serie30dias: DiaEstudo[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      serie30dias.push({ data: str, count: countByDay.get(str) || 0 });
    }

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      if ((countByDay.get(str) || 0) > 0) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }

    const countByAssunto = new Map<string, number>();
    registros.forEach((r) => {
      const nome = r.subtopico || r.topico || r.modulo_slug || 'Geral';
      countByAssunto.set(nome, (countByAssunto.get(nome) || 0) + 1);
    });
    const topAssuntos: AssuntoTop[] = Array.from(countByAssunto.entries())
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const desempenho: DesempenhoData = {
      hoje,
      metaDiaria: META_DIARIA,
      streak,
      totalGeral,
      totalTodosTempos,
      serie30dias,
      topAssuntos,
    };

    return <ProgressoEstudoDashboard dados={desempenho} />;
  } catch (error) {
    logger.error('Failed to load progresso-estudo', error, { userId });
    return (
      <DashboardMobilePage
        variant="default"
        className="dashboard-surface flex min-h-screen items-center justify-center bg-background p-6 text-foreground"
      >
        <div className="max-w-md space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Erro ao carregar dados. Tente novamente ou use “Voltar para a Vitrine” no topo da página.
          </p>
        </div>
      </DashboardMobilePage>
    );
  }
}
