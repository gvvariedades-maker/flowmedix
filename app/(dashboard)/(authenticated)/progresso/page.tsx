import { redirect } from 'next/navigation';
import { toFreemiumTimezoneYmd } from '@/lib/freemium/constants';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { ProgressoEstudoDashboard } from '@/components/dashboard/progresso/ProgressoEstudoDashboard';
import type { AssuntoTop, DesempenhoData, DiaEstudo } from '@/components/dashboard/progresso/ProgressoEstudoDashboard';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_CENTER } from '@/lib/layout/mobileBottomNav';
import { cn } from '@/lib/utils';

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

    type ProgressoRegistro = {
      created_at: string;
      subtopico: string | null;
      topico: string | null;
      modulo_slug: string;
    };

    const registros = (data || []) as ProgressoRegistro[];
    const totalTodosTempos = totalHistorico ?? 0;

    const toDateStr = (iso: string) => toFreemiumTimezoneYmd(new Date(iso));
    const todayStr = toFreemiumTimezoneYmd();

    /** Uma questão por `modulo_slug` por dia (evita inflar com linhas duplicadas no histórico). */
    const slugsPorDia = new Map<string, Set<string>>();
    for (const r of registros) {
      const d = toDateStr(r.created_at);
      const slug = r.modulo_slug?.trim();
      if (!slug) continue;
      let set = slugsPorDia.get(d);
      if (!set) {
        set = new Set();
        slugsPorDia.set(d, set);
      }
      set.add(slug);
    }

    const hoje = slugsPorDia.get(todayStr)?.size ?? 0;
    const totalGeral = new Set(
      registros.map((r) => r.modulo_slug?.trim()).filter((slug): slug is string => Boolean(slug)),
    ).size;

    const countByDay = new Map<string, number>();
    slugsPorDia.forEach((slugs, d) => {
      countByDay.set(d, slugs.size);
    });

    const serie30dias: DiaEstudo[] = [];
    for (let i = 29; i >= 0; i--) {
      const anchor = new Date();
      anchor.setDate(anchor.getDate() - i);
      const str = toFreemiumTimezoneYmd(anchor);
      serie30dias.push({ data: str, count: countByDay.get(str) || 0 });
    }

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const anchor = new Date();
      anchor.setDate(anchor.getDate() - i);
      const str = toFreemiumTimezoneYmd(anchor);
      if ((countByDay.get(str) || 0) > 0) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }

    const countByAssunto = new Map<string, Set<string>>();
    registros.forEach((r) => {
      const slug = r.modulo_slug?.trim();
      if (!slug) return;
      const nome = r.subtopico || r.topico || r.modulo_slug || 'Geral';
      let slugs = countByAssunto.get(nome);
      if (!slugs) {
        slugs = new Set();
        countByAssunto.set(nome, slugs);
      }
      slugs.add(slug);
    });
    const topAssuntos: AssuntoTop[] = Array.from(countByAssunto.entries())
      .map(([nome, slugs]) => ({ nome, count: slugs.size }))
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
        className={cn('dashboard-surface bg-background p-6 text-foreground', DASHBOARD_PAGE_CENTER)}
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
