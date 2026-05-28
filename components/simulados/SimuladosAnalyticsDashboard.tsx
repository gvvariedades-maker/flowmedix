'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Flame,
  Goal,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSimuladoAnalytics, getSimuladoHistory, SimuladoApiError } from '@/lib/simulado/client';
import { createRequestTimer, trackSimuladoAnalyticsEvent } from '@/lib/simulado/analyticsTelemetry';
import type { SimuladoAnalyticsResponse, SimuladoHistoryResponse } from '@/lib/simulado/types';
import type { SimuladoAnalyticsMode, SimuladoAnalyticsPeriod } from '@/lib/simulado/analyticsSummary';
import type { SimuladoHistoryStatus } from '@/lib/simulado/history';

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

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
] as const satisfies ReadonlyArray<{ value: SimuladoHistoryStatus; label: string }>;

function buildFilterHref(
  periodo: SimuladoAnalyticsPeriod,
  modo: SimuladoAnalyticsMode,
  status: SimuladoHistoryStatus,
  dimensions?: {
    banca?: string | null;
    topico?: string | null;
    subtopico?: string | null;
  },
): string {
  const params = new URLSearchParams();
  params.set('periodo', periodo);
  params.set('modo', modo);
  params.set('status', status);
  if (dimensions?.banca) params.set('banca', dimensions.banca);
  if (dimensions?.topico) params.set('topico', dimensions.topico);
  if (dimensions?.subtopico) params.set('subtopico', dimensions.subtopico);
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

function formatProgress(value: number): string {
  const clamped = Math.max(0, Math.min(100, value));
  return `${Math.round(clamped)}%`;
}

export function SimuladosAnalyticsDashboard({
  periodoAtual,
  modoAtual,
  statusInicial,
  bancaAtual,
  topicoAtual,
  subtopicoAtual,
}: {
  periodoAtual: SimuladoAnalyticsPeriod;
  modoAtual: SimuladoAnalyticsMode;
  statusInicial: SimuladoHistoryStatus;
  bancaAtual: string | null;
  topicoAtual: string | null;
  subtopicoAtual: string | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<SimuladoAnalyticsResponse | null>(null);
  const [historyData, setHistoryData] = useState<SimuladoHistoryResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [bancaInput, setBancaInput] = useState(bancaAtual ?? '');
  const [topicoInput, setTopicoInput] = useState(topicoAtual ?? '');
  const [subtopicoInput, setSubtopicoInput] = useState(subtopicoAtual ?? '');
  const historyStatus = statusInicial;

  useEffect(() => {
    trackSimuladoAnalyticsEvent('page_view', {
      periodo: periodoAtual,
      modo: modoAtual,
      status: historyStatus,
      banca: bancaAtual,
      topico: topicoAtual,
      subtopico: subtopicoAtual,
    });
  }, [periodoAtual, modoAtual, historyStatus, bancaAtual, topicoAtual, subtopicoAtual]);

  useEffect(() => {
    let mounted = true;
    const timer = createRequestTimer();
    getSimuladoAnalytics({
      periodo: periodoAtual,
      modo: modoAtual,
      banca: bancaAtual ?? undefined,
      topico: topicoAtual ?? undefined,
      subtopico: subtopicoAtual ?? undefined,
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
  }, [periodoAtual, modoAtual, bancaAtual, topicoAtual, subtopicoAtual]);

  useEffect(() => {
    let mounted = true;
    const timer = createRequestTimer();
    getSimuladoHistory({
      periodo: periodoAtual,
      modo: modoAtual,
      banca: bancaAtual ?? undefined,
      topico: topicoAtual ?? undefined,
      subtopico: subtopicoAtual ?? undefined,
      status: historyStatus,
      page: historyPage,
      page_size: 8,
    })
      .then((result) => {
        if (!mounted) return;
        setHistoryData(result);
        setError(null);
        trackSimuladoAnalyticsEvent('history_fetch_success', {
          duration_ms: timer.done(),
          page: historyPage,
          status: historyStatus,
          total: result.pagination.total,
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        if (err instanceof SimuladoApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar o histórico de simulados.');
        }
        trackSimuladoAnalyticsEvent('history_fetch_error', {
          duration_ms: timer.done(),
          page: historyPage,
          status: historyStatus,
          error: err instanceof Error ? err.message : 'unknown_error',
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingHistory(false);
      });

    return () => {
      mounted = false;
    };
  }, [periodoAtual, modoAtual, historyPage, historyStatus, bancaAtual, topicoAtual, subtopicoAtual]);

  const kpis = data?.kpis;
  const history = historyData?.sessions ?? [];
  const totalPages = historyData?.pagination.total_pages ?? 1;
  const evolucao = data?.evolucao_temporal ?? [];
  const topBancas = data?.desempenho.por_banca ?? [];
  const topTopicos = data?.desempenho.por_topico ?? [];
  const topSubtopicos = data?.desempenho.por_subtopico ?? [];
  const padroesErro = data?.padroes_erro ?? [];
  const metas = data?.metas_streaks.metas;
  const streaks = data?.metas_streaks.streaks;

  const maxQuestoesTimeline = Math.max(1, ...evolucao.map((item) => item.total_questoes));

  const hasDimensionInput = bancaInput.trim() || topicoInput.trim() || subtopicoInput.trim();

  function applyDimensionFilters() {
    const banca = bancaInput.trim() || null;
    const topico = topicoInput.trim() || null;
    const subtopico = subtopicoInput.trim() || null;
    trackSimuladoAnalyticsEvent('filters_apply', {
      periodo: periodoAtual,
      modo: modoAtual,
      status: historyStatus,
      banca,
      topico,
      subtopico,
    });
    router.push(
      buildFilterHref(periodoAtual, modoAtual, historyStatus, {
        banca,
        topico,
        subtopico,
      }),
    );
  }

  function clearDimensionInputs() {
    trackSimuladoAnalyticsEvent('filters_clear', {
      periodo: periodoAtual,
      modo: modoAtual,
      status: historyStatus,
    });
    setBancaInput('');
    setTopicoInput('');
    setSubtopicoInput('');
    router.push(buildFilterHref(periodoAtual, modoAtual, historyStatus));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-12 md:px-8 md:pt-8">
      <Card className="md:col-span-12">
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Aplique período, modo e dimensões para atualizar analytics e histórico de simulados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Periodo</p>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((periodo) => (
                <Link
                  key={periodo.value}
                  href={buildFilterHref(periodo.value, modoAtual, historyStatus, {
                    banca: bancaAtual,
                    topico: topicoAtual,
                    subtopico: subtopicoAtual,
                  })}
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
                  href={buildFilterHref(periodoAtual, modo.value, historyStatus, {
                    banca: bancaAtual,
                    topico: topicoAtual,
                    subtopico: subtopicoAtual,
                  })}
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

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dimensões ativas</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                Banca: {bancaAtual ?? 'Todas'}
              </span>
              <span className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                Tópico: {topicoAtual ?? 'Todos'}
              </span>
              <span className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                Subtópico: {subtopicoAtual ?? 'Todos'}
              </span>
              {(bancaAtual || topicoAtual || subtopicoAtual) ? (
                <Link
                  href={buildFilterHref(periodoAtual, modoAtual, historyStatus)}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  Limpar dimensões
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <input
              value={bancaInput}
              onChange={(event) => setBancaInput(event.target.value)}
              placeholder="Filtrar banca"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              value={topicoInput}
              onChange={(event) => setTopicoInput(event.target.value)}
              placeholder="Filtrar tópico"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <input
              value={subtopicoInput}
              onChange={(event) => setSubtopicoInput(event.target.value)}
              placeholder="Filtrar subtópico"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={applyDimensionFilters} disabled={!hasDimensionInput}>
              Aplicar dimensões
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={clearDimensionInputs}>
              Limpar dimensões
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-cyan-400" aria-hidden />
            Visão analítica de simulados
          </CardTitle>
          <CardDescription>
            Compare sua performance no tempo, encontre pontos fracos e acompanhe consistência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Esta área é dedicada ao seu desempenho em simulados e não se mistura com progresso de estudo.</p>
          <p>
            Filtros ativos: período <strong>{periodoAtual}</strong>, modo <strong>{modoAtual}</strong>, banca{' '}
            <strong>{bancaAtual ?? 'todas'}</strong>, tópico <strong>{topicoAtual ?? 'todos'}</strong>.
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />
            CTA rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/simulados">Ver simulados</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-12">
        <CardHeader>
          <CardTitle className="text-base">KPIs do período</CardTitle>
          <CardDescription>Métricas principais para leitura rápida da sua fase atual.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Total de simulados</p>
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
            <p className="text-xs text-muted-foreground">Melhor score</p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics ? '...' : formatPercent(kpis?.melhor_score)}
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
          <div className="rounded-xl border border-border p-3">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Dias ativos no período
            </p>
            <p className="mt-1 text-lg font-semibold">
              {loadingAnalytics ? '...' : (streaks?.dias_ativos_periodo ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-12 xl:col-span-8">
        <CardHeader>
          <CardTitle className="text-base">Evolução temporal</CardTitle>
          <CardDescription>Evolução diária de volume e percentual de acerto.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando evolução...</p>
          ) : evolucao.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados de evolução no período selecionado.</p>
          ) : (
            <div className="space-y-3">
              {evolucao.map((item) => {
                const width = Math.max(6, Math.round((item.total_questoes / maxQuestoesTimeline) * 100));
                return (
                  <div key={item.data_ref} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDateLabel(item.data_ref)}</span>
                      <span>
                        {item.total_questoes} questoes - {formatPercent(item.percentual_acerto)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-cyan-500/80 transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-12 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Goal className="h-4 w-4 text-emerald-400" aria-hidden />
            Metas e consistência
          </CardTitle>
          <CardDescription>Streaks e progresso das metas semanais/mensais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Streak atual</p>
            <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold">
              <Flame className="h-4 w-4 text-orange-400" aria-hidden />
              {loadingAnalytics ? '...' : `${streaks?.streak_atual_dias ?? 0} dias`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Melhor streak: {loadingAnalytics ? '...' : `${streaks?.melhor_streak_dias ?? 0} dias`}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Meta semanal de sessões</p>
            <p className="text-sm font-medium">
              {loadingAnalytics
                ? '...'
                : `${metas?.sessoes_ultimos_7d ?? 0} / ${metas?.meta_semanal_sessoes ?? 0}`}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500/80"
                style={{ width: `${metas ? formatProgress(metas.progresso_meta_semanal) : '0%'}` }}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Meta mensal de questões</p>
            <p className="text-sm font-medium">
              {loadingAnalytics
                ? '...'
                : `${metas?.questoes_ultimos_30d ?? 0} / ${metas?.meta_mensal_questoes ?? 0}`}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-cyan-500/80"
                style={{ width: `${metas ? formatProgress(metas.progresso_meta_mensal) : '0%'}` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-12 xl:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Desempenho por banca</CardTitle>
          <CardDescription>Onde seu rendimento está melhor ou pior por banca.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando bancas...</p>
          ) : topBancas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados por banca no período.</p>
          ) : (
            topBancas.slice(0, 8).map((row) => (
              <Link
                key={row.nome}
                href={buildFilterHref(periodoAtual, modoAtual, historyStatus, {
                  banca: row.nome,
                  topico: topicoAtual,
                  subtopico: subtopicoAtual,
                })}
                className="block space-y-1 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{row.nome}</span>
                  <span className="text-muted-foreground">{formatPercent(row.percentual_acerto)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-cyan-500/80"
                    style={{ width: `${formatProgress(row.percentual_acerto ?? 0)}` }}
                  />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-12 xl:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Desempenho por tópico</CardTitle>
          <CardDescription>Ranking dos tópicos com maior volume no período.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando tópicos...</p>
          ) : topTopicos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados por tópico no período.</p>
          ) : (
            topTopicos.slice(0, 8).map((row) => (
              <Link
                key={row.nome}
                href={buildFilterHref(periodoAtual, modoAtual, historyStatus, {
                  banca: bancaAtual,
                  topico: row.nome,
                  subtopico: subtopicoAtual,
                })}
                className="block space-y-1 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{row.nome}</span>
                  <span className="text-muted-foreground">{formatPercent(row.percentual_acerto)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${formatProgress(row.percentual_acerto ?? 0)}` }}
                  />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-12 xl:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Desempenho por subtópico</CardTitle>
          <CardDescription>Detalhamento para priorizar revisão com precisão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando subtópicos...</p>
          ) : topSubtopicos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados por subtópico no período.</p>
          ) : (
            topSubtopicos.slice(0, 8).map((row) => (
              <Link
                key={row.nome}
                href={buildFilterHref(periodoAtual, modoAtual, historyStatus, {
                  banca: bancaAtual,
                  topico: topicoAtual,
                  subtopico: row.nome,
                })}
                className="block space-y-1 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{row.nome}</span>
                  <span className="text-muted-foreground">{formatPercent(row.percentual_acerto)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-violet-500/80"
                    style={{ width: `${formatProgress(row.percentual_acerto ?? 0)}` }}
                  />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-12">
        <CardHeader>
          <CardTitle className="text-base">Padrões de erro</CardTitle>
          <CardDescription>Pontos de atenção por banca, tópico e subtópico.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAnalytics ? (
            <p className="text-sm text-muted-foreground">Carregando padrões de erro...</p>
          ) : padroesErro.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum padrão de erro relevante no período.</p>
          ) : (
            <div className="space-y-2">
              {padroesErro.slice(0, 10).map((row) => (
                <div key={`${row.banca}-${row.topico}-${row.subtopico}`} className="rounded-xl border border-border p-3">
                  <div className="grid gap-2 md:grid-cols-[1.5fr_1.5fr_1fr_auto] md:items-center">
                    <p className="text-sm font-medium">{row.banca}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.topico}
                      {row.subtopico ? ` - ${row.subtopico}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.erros}/{row.total_questoes} erros
                    </p>
                    <p className="text-sm font-semibold text-rose-400">{formatPercent(row.taxa_erro)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-12">
        <CardHeader>
          <CardTitle className="text-base">Últimas sessões</CardTitle>
          <CardDescription>Tabela histórica com paginação e drill-down por sessão.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <Link
                key={status.value}
                href={buildFilterHref(periodoAtual, modoAtual, status.value, {
                  banca: bancaAtual,
                  topico: topicoAtual,
                  subtopico: subtopicoAtual,
                })}
                className={cn(
                  'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  historyStatus === status.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-muted',
                )}
              >
                {status.label}
              </Link>
            ))}
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : loadingHistory ? (
            <p className="text-sm text-muted-foreground">Carregando sessões...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão encontrada para os filtros selecionados.</p>
          ) : (
            <div className="space-y-2">
              {history.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSessionId((prev) => {
                        const next = prev === row.id ? null : row.id;
                        trackSimuladoAnalyticsEvent(
                          next ? 'history_session_expand' : 'history_session_collapse',
                          { session_id: row.id },
                        );
                        return next;
                      })
                    }
                    className="grid w-full grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-2 text-left"
                  >
                    <span className="truncate text-muted-foreground">
                      {new Date(row.concluida_em ?? row.created_at).toLocaleDateString('pt-BR')} - {row.modo}
                    </span>
                    <span className="font-medium">{formatPercent(row.percentual_acerto)}</span>
                    <span className="text-xs text-muted-foreground">{row.status}</span>
                    <span className="justify-self-end text-muted-foreground">
                      {expandedSessionId === row.id ? (
                        <ChevronUp className="h-4 w-4" aria-hidden />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      )}
                    </span>
                  </button>
                  {expandedSessionId === row.id ? (
                    <div className="mt-3 grid gap-2 rounded-lg border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground md:grid-cols-3">
                      <p>Questões: {row.total_questoes ?? 0}</p>
                      <p>Acertos/Erros: {row.acertos ?? 0}/{row.erros ?? 0}</p>
                      <p>Tempo médio: {formatDuration(row.tempo_medio_ms)}</p>
                      <p>Tempo total: {formatDuration(row.tempo_total_ms)}</p>
                      <p>Criado em: {formatDateTime(row.created_at)}</p>
                      <p>Concluído em: {row.concluida_em ? formatDateTime(row.concluida_em) : '--'}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {!error && !loadingHistory && history.length > 0 ? (
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPage <= 1}
                onClick={() => {
                  const toPage = Math.max(1, historyPage - 1);
                  trackSimuladoAnalyticsEvent('history_page_change', {
                    from_page: historyPage,
                    to_page: toPage,
                  });
                  setHistoryPage(toPage);
                }}
              >
                Anterior
              </Button>
              <p className="text-xs text-muted-foreground">
                Página {historyPage} de {totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPage >= totalPages}
                onClick={() => {
                  const toPage = Math.min(totalPages, historyPage + 1);
                  trackSimuladoAnalyticsEvent('history_page_change', {
                    from_page: historyPage,
                    to_page: toPage,
                  });
                  setHistoryPage(toPage);
                }}
              >
                Próxima
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
