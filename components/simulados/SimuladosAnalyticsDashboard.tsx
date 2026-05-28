'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Clock3, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSimuladoAnalytics, SimuladoApiError } from '@/lib/simulado/client';
import { createRequestTimer, trackSimuladoAnalyticsEvent } from '@/lib/simulado/analyticsTelemetry';
import type { SimuladoAnalyticsResponse } from '@/lib/simulado/types';
import type { SimuladoAnalyticsMode, SimuladoAnalyticsPeriod } from '@/lib/simulado/analyticsSummary';

const PERIODOS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
] as const satisfies ReadonlyArray<{ value: SimuladoAnalyticsPeriod; label: string }>;

const MODOS = [
  { value: 'todos', label: 'Todos os modos' },
  { value: 'treino', label: 'Treino' },
  { value: 'prova', label: 'Prova' },
] as const satisfies ReadonlyArray<{ value: SimuladoAnalyticsMode; label: string }>;

function buildFilterHref(
  periodo: SimuladoAnalyticsPeriod,
  modo: SimuladoAnalyticsMode,
): string {
  const params = new URLSearchParams();
  params.set('periodo', periodo);
  params.set('modo', modo);
  return `/desempenho/simulados?${params.toString()}`;
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '--';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return `${Math.round(value)}%`;
}

function formatDateLabel(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTrendLabel(values: Array<number | null>): {
  label: 'Melhorando' | 'Estável' | 'Atenção';
  detail: string;
} {
  const cleanValues = values.filter((value): value is number => typeof value === 'number');
  if (cleanValues.length < 4) {
    return { label: 'Estável', detail: 'Ainda sem dados suficientes para tendência.' };
  }

  const recentSlice = cleanValues.slice(-3);
  const previousSlice = cleanValues.slice(-6, -3);
  if (recentSlice.length === 0 || previousSlice.length === 0) {
    return { label: 'Estável', detail: 'Continue respondendo para gerar tendência.' };
  }

  const recentAvg = recentSlice.reduce((sum, item) => sum + item, 0) / recentSlice.length;
  const previousAvg = previousSlice.reduce((sum, item) => sum + item, 0) / previousSlice.length;
  const delta = recentAvg - previousAvg;
  if (delta >= 3) {
    return { label: 'Melhorando', detail: `Subiu ${Math.round(delta)} pontos nas sessões recentes.` };
  }
  if (delta <= -3) {
    return { label: 'Atenção', detail: `Caiu ${Math.round(Math.abs(delta))} pontos nas sessões recentes.` };
  }
  return { label: 'Estável', detail: 'Seu desempenho está consistente nas últimas sessões.' };
}

export function SimuladosAnalyticsDashboard({
  periodoAtual,
  modoAtual,
  statusInicial: _statusInicial,
  bancaAtual: _bancaAtual,
  topicoAtual: _topicoAtual,
  subtopicoAtual: _subtopicoAtual,
}: {
  periodoAtual: SimuladoAnalyticsPeriod;
  modoAtual: SimuladoAnalyticsMode;
  statusInicial: 'todos' | 'aberto' | 'concluido' | 'cancelado';
  bancaAtual: string | null;
  topicoAtual: string | null;
  subtopicoAtual: string | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<SimuladoAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackSimuladoAnalyticsEvent('page_view', {
      periodo: periodoAtual,
      modo: modoAtual,
      screen: 'simulados_simple',
    });
  }, [periodoAtual, modoAtual]);

  useEffect(() => {
    let mounted = true;
    const timer = createRequestTimer();
    getSimuladoAnalytics({
      periodo: periodoAtual,
      modo: modoAtual,
    })
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setError(null);
        trackSimuladoAnalyticsEvent('analytics_fetch_success', {
          duration_ms: timer.done(),
          total_simulados: result.kpis.total_simulados,
          periodo: periodoAtual,
          modo: modoAtual,
          screen: 'simulados_simple',
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        if (err instanceof SimuladoApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar o analytics de simulados.');
        }
        trackSimuladoAnalyticsEvent('analytics_fetch_error', {
          duration_ms: timer.done(),
          periodo: periodoAtual,
          modo: modoAtual,
          screen: 'simulados_simple',
          error: err instanceof Error ? err.message : 'unknown_error',
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingAnalytics(false);
      });

    return () => {
      mounted = false;
    };
  }, [periodoAtual, modoAtual]);

  const kpis = data?.kpis;
  const evolucao = data?.evolucao_temporal ?? [];

  const prioridades = useMemo(() => {
    const bySubtopico = (data?.desempenho.por_subtopico ?? []).filter((item) => item.total_questoes > 0);
    const byTopico = (data?.desempenho.por_topico ?? []).filter((item) => item.total_questoes > 0);
    const source = bySubtopico.length > 0 ? bySubtopico : byTopico;
    return [...source]
      .sort((a, b) => {
        const scoreA = typeof a.percentual_acerto === 'number' ? a.percentual_acerto : 101;
        const scoreB = typeof b.percentual_acerto === 'number' ? b.percentual_acerto : 101;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return b.total_questoes - a.total_questoes;
      })
      .slice(0, 2);
  }, [data?.desempenho.por_subtopico, data?.desempenho.por_topico]);

  const trend = useMemo(
    () => getTrendLabel(evolucao.map((item) => item.percentual_acerto)),
    [evolucao],
  );

  return (
    <div className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:px-8 md:pt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Escolha período e modo para uma leitura rápida do seu desempenho.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Periodo</p>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((periodo) => (
                <Link
                  key={periodo.value}
                  href={buildFilterHref(periodo.value, modoAtual)}
                  className={cn(
                    'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    periodoAtual === periodo.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {periodo.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modo</p>
            <div className="flex flex-wrap gap-2">
              {MODOS.map((modo) => (
                <Link
                  key={modo.value}
                  href={buildFilterHref(periodoAtual, modo.value)}
                  className={cn(
                    'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    modoAtual === modo.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {modo.label}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-cyan-400" aria-hidden />
            Seu desempenho hoje
          </CardTitle>
          <CardDescription>Resumo direto do seu resultado no período escolhido.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Simulados concluídos</p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics ? '...' : (kpis?.total_simulados ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" aria-hidden /> Média de acerto
            </p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics ? '...' : formatPercent(kpis?.media_acerto)}
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Questões respondidas</p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics
                ? '...'
                : evolucao.reduce((sum, item) => sum + item.total_questoes, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden /> Tempo médio por questão
            </p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics ? '...' : formatDuration(kpis?.tempo_medio_ms)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onde focar agora</CardTitle>
          <CardDescription>Priorize os assuntos com menor acerto para ganhar pontos mais rápido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando prioridades...</p>
          ) : prioridades.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Responda mais questões para receber prioridades de revisão.
            </p>
          ) : (
            <div className="space-y-2">
              {prioridades.map((item) => (
                <div key={item.nome} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{item.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Acerto atual: {formatPercent(item.percentual_acerto)} ({item.total_questoes} questões)
                  </p>
                </div>
              ))}
            </div>
          )}
          <Button
            asChild
            className="w-full rounded-xl"
            onClick={() => trackSimuladoAnalyticsEvent('quick_action_train_now', { origem: 'simulados_simple' })}
          >
            <Link href="/simulados" className="inline-flex items-center justify-center gap-2">
              <ClipboardList className="h-4 w-4" aria-hidden />
              Treinar agora
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />
            Sua tendência na semana
          </CardTitle>
          <CardDescription>Leitura rápida para entender se você está melhorando.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <div className="rounded-xl border border-border p-3">
              <p className="text-lg font-semibold">{trend.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{trend.detail}</p>
              {evolucao.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Última atualização: {formatDateLabel(evolucao[evolucao.length - 1]?.data_ref ?? '')}
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
