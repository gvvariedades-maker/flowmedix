import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesempenhoAtividadeDashboard } from '@/components/dashboard/desempenho/DesempenhoAtividadeDashboard';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import type { AssuntoTop, DesempenhoData, DiaEstudo } from '@/components/dashboard/performance/types';
import { toFreemiumTimezoneYmd } from '@/lib/freemium/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { E2E_DESEMPENHO_TITULO_AULA, E2E_DESEMPENHO_TITULO_LONGO } from '@/lib/e2e/constants';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';

export type { AssuntoTop, DesempenhoData, DiaEstudo } from '@/components/dashboard/performance/types';

const META_DIARIA = 10;

/**
 * Seed E2E (`E2E_DASHBOARD_BYPASS`): 30 dias civis de Brasília com atividade
 * determinística, para o Playwright validar a grade do heatmap, a legenda e o
 * diálogo de reset sem depender do Supabase.
 */
function buildE2eAtividade(): DesempenhoData {
  const contagens = [0, 2, 5, 9, 14, 1, 3];
  const serie30dias: DiaEstudo[] = [];
  for (let i = 29; i >= 0; i--) {
    const anchor = new Date();
    anchor.setDate(anchor.getDate() - i);
    serie30dias.push({
      data: toFreemiumTimezoneYmd(anchor),
      count: contagens[(29 - i) % contagens.length]!,
    });
  }

  const total = serie30dias.reduce((soma, dia) => soma + dia.count, 0);
  return {
    hoje: serie30dias[serie30dias.length - 1]!.count,
    metaDiaria: META_DIARIA,
    streak: 3,
    totalGeral: total,
    totalTodosTempos: total,
    serie30dias,
    topAssuntos: [
      { nome: E2E_DESEMPENHO_TITULO_LONGO, count: 8 },
      { nome: E2E_DESEMPENHO_TITULO_AULA, count: 5 },
    ],
  };
}

const SHELL_DESCRIPTION =
  'Hábitos, sequência e privacidade — métricas secundárias ao mapa de Estudo.';

function ShellAction() {
  return (
    <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
      <Link href="/estudar" className="inline-flex w-full items-center justify-center sm:w-auto">
        <BookOpen className="h-4 w-4" aria-hidden />
        Praticar na vitrine
      </Link>
    </Button>
  );
}

export default async function DesempenhoAtividadePage() {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');
  if (e2eBypass) {
    return (
      <DesempenhoHubShell description={SHELL_DESCRIPTION} action={<ShellAction />}>
        <DesempenhoAtividadeDashboard dados={buildE2eAtividade()} />
      </DesempenhoHubShell>
    );
  }

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
      logger.error('Failed to fetch total count for desempenho-atividade', errorTotal, { userId });
    }
    if (error) {
      logger.error('Failed to fetch history for desempenho-atividade', error, { userId });
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

    return (
      <DesempenhoHubShell description={SHELL_DESCRIPTION} action={<ShellAction />}>
        <DesempenhoAtividadeDashboard dados={desempenho} />
      </DesempenhoHubShell>
    );
  } catch (error) {
    logger.error('Failed to load desempenho-atividade', error, { userId });
    // Erro de leitura não vira "zero dias estudados": estado explícito com retry.
    return (
      <DesempenhoHubShell description={SHELL_DESCRIPTION} action={<ShellAction />}>
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <section
            aria-label="Erro ao carregar atividade"
            role="alert"
            className="metric-card flex flex-col gap-3 p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-[var(--color-danger-text)]" aria-hidden />
              Não conseguimos carregar sua atividade
            </p>
            <p className="text-sm text-muted-foreground">
              Sua sequência e seu histórico continuam salvos — apenas a leitura falhou agora.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/desempenho/atividade"
                className="btn-editorial-primary inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold"
              >
                Tentar novamente
              </Link>
              <Link
                href="/estudar"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground"
              >
                Ir para a vitrine
              </Link>
            </div>
          </section>
        </div>
      </DesempenhoHubShell>
    );
  }
}
