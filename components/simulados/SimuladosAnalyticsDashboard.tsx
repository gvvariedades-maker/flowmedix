'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSimuladoAnalytics, SimuladoApiError } from '@/lib/simulado/client';
import { createRequestTimer, trackSimuladoAnalyticsEvent } from '@/lib/simulado/analyticsTelemetry';
import type { SimuladoAnalyticsResponse } from '@/lib/simulado/types';
import type { SimuladoAnalyticsMode, SimuladoAnalyticsPeriod } from '@/lib/simulado/analyticsSummary';

const PERIODOS = [
  { value: '1d', label: 'Hoje' },
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

type KpiValueTone = 'brand' | 'emerald' | 'muted' | 'default';

const KPI_VALUE_TONE_CLASSES: Record<KpiValueTone, string> = {
  brand: 'text-[#3d6b0f]',
  emerald: 'text-emerald-600',
  muted: 'text-slate-400',
  default: 'text-slate-900',
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">{children}</p>
  );
}

function ResumoMetric({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={cn('mt-1 text-lg font-semibold', valueClassName)}>{value}</p>
    </div>
  );
}

function KpiMetricCard({
  label,
  value,
  highlight,
  valueTone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  valueTone: KpiValueTone;
}) {
  return (
    <div
      className={cn(
        'card-elevated p-4',
        highlight && 'border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.06)]',
      )}
    >
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-[26px] font-bold tracking-tight',
          KPI_VALUE_TONE_CLASSES[valueTone],
        )}
      >
        {value}
      </p>
    </div>
  );
}

const FILTER_PILL_ACTIVE =
  'border-[rgba(143,224,32,0.45)] bg-[rgba(143,224,32,0.12)] text-[#3d6b0f]';
const FILTER_PILL_INACTIVE =
  'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50';

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
  const [data, setData] = useState<SimuladoAnalyticsResponse | null>(null);
  const [dataGeral, setDataGeral] = useState<SimuladoAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingGeral, setLoadingGeral] = useState<boolean>(true);
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

  useEffect(() => {
    let mounted = true;
    getSimuladoAnalytics({
      periodo: '12m',
      modo: 'todos',
    })
      .then((result) => {
        if (!mounted) return;
        setDataGeral(result);
      })
      .catch(() => {
        if (!mounted) return;
        setDataGeral(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingGeral(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = data?.kpis;
  const evolucao = useMemo(
    () => data?.evolucao_temporal ?? [],
    [data?.evolucao_temporal],
  );
  const evolucaoGeral = useMemo(
    () => dataGeral?.evolucao_temporal ?? [],
    [dataGeral?.evolucao_temporal],
  );

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

  const resumoPeriodo = useMemo(() => {
    const respondidas = evolucao.reduce((sum, item) => sum + item.total_questoes, 0);
    const acertos = evolucao.reduce((sum, item) => sum + item.acertos, 0);
    const erros = evolucao.reduce((sum, item) => sum + item.erros, 0);
    const percentual =
      respondidas > 0 ? (acertos / respondidas) * 100 : (typeof kpis?.media_acerto === 'number' ? kpis.media_acerto : null);
    return { respondidas, acertos, erros, percentual };
  }, [evolucao, kpis]);

  const resumoGeral = useMemo(() => {
    const respondidas = evolucaoGeral.reduce((sum, item) => sum + item.total_questoes, 0);
    const acertos = evolucaoGeral.reduce((sum, item) => sum + item.acertos, 0);
    const erros = evolucaoGeral.reduce((sum, item) => sum + item.erros, 0);
    const percentual =
      respondidas > 0
        ? (acertos / respondidas) * 100
        : (typeof dataGeral?.kpis.media_acerto === 'number' ? dataGeral.kpis.media_acerto : null);
    return { respondidas, acertos, erros, percentual };
  }, [dataGeral, evolucaoGeral]);

  const deltaPontosPercentuais = useMemo(() => {
    if (typeof resumoPeriodo.percentual !== 'number' || typeof resumoGeral.percentual !== 'number') return null;
    return resumoPeriodo.percentual - resumoGeral.percentual;
  }, [resumoGeral.percentual, resumoPeriodo.percentual]);

  const deltaMensagem = useMemo(() => {
    if (deltaPontosPercentuais === null) return 'Sem dados suficientes para comparar período e geral.';
    const deltaAbs = Math.round(Math.abs(deltaPontosPercentuais));
    if (deltaAbs === 0) return 'No período, você está igual ao seu geral.';
    if (deltaPontosPercentuais > 0) return `No período, você está ${deltaAbs} p.p. acima do seu geral.`;
    return `No período, você está ${deltaAbs} p.p. abaixo do seu geral.`;
  }, [deltaPontosPercentuais]);

  const tempoMedioValor = loadingAnalytics ? '...' : formatDuration(kpis?.tempo_medio_ms);
  const tempoMedioTone: KpiValueTone = tempoMedioValor === '--' ? 'muted' : 'default';

  const resumoSectionTitle =
    periodoAtual === '1d' ? 'Seu desempenho hoje' : 'Seu desempenho no período';
  const resumoSectionHint =
    periodoAtual === '1d'
      ? 'Simulados concluídos hoje (horário de Brasília).'
      : 'Resumo direto do seu resultado no período escolhido.';

  return (
    <div className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:px-8 md:pt-8">
      <div className="card-elevated p-4">
        <p className="text-[11px] text-slate-600">
          Escolha período e modo para uma leitura rápida do seu desempenho.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">Período</p>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((periodo) => (
                <Link
                  key={periodo.value}
                  href={buildFilterHref(periodo.value, modoAtual)}
                  className={cn(
                    'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    periodoAtual === periodo.value ? FILTER_PILL_ACTIVE : FILTER_PILL_INACTIVE,
                  )}
                >
                  {periodo.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">Modo</p>
            <div className="flex flex-wrap gap-2">
              {MODOS.map((modo) => (
                <Link
                  key={modo.value}
                  href={buildFilterHref(periodoAtual, modo.value)}
                  className={cn(
                    'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    modoAtual === modo.value ? FILTER_PILL_ACTIVE : FILTER_PILL_INACTIVE,
                  )}
                >
                  {modo.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <SectionLabel>{resumoSectionTitle}</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">{resumoSectionHint}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiMetricCard
            label="Simulados concluídos"
            value={loadingAnalytics ? '...' : String(kpis?.total_simulados ?? 0)}
            valueTone="brand"
          />
          <KpiMetricCard
            label="Média de acerto"
            value={loadingAnalytics ? '...' : formatPercent(kpis?.media_acerto)}
            highlight
            valueTone="emerald"
          />
          <KpiMetricCard
            label="Questões respondidas"
            value={
              loadingAnalytics
                ? '...'
                : String(evolucao.reduce((sum, item) => sum + item.total_questoes, 0))
            }
            valueTone="default"
          />
          <KpiMetricCard
            label="Tempo médio por questão"
            value={tempoMedioValor}
            valueTone={tempoMedioTone}
          />
        </div>
      </section>

      <section>
        <SectionLabel>Resumo comparativo</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Mesmo formato do resultado final do simulado: período atual e geral.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card-elevated p-4">
            <p className="text-sm font-semibold text-slate-800">No período</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ResumoMetric
                label="% de acerto"
                value={loadingAnalytics ? '...' : formatPercent(resumoPeriodo.percentual)}
                valueClassName="text-[#3d6b0f]"
              />
              <ResumoMetric
                label="Acertos"
                value={loadingAnalytics ? '...' : resumoPeriodo.acertos}
              />
              <ResumoMetric
                label="Erros"
                value={loadingAnalytics ? '...' : resumoPeriodo.erros}
                valueClassName="text-rose-600"
              />
              <ResumoMetric
                label="Questões respondidas"
                value={loadingAnalytics ? '...' : resumoPeriodo.respondidas}
              />
            </div>
          </div>

          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-600 sm:col-span-2">
            {deltaMensagem}
          </p>

          <div className="card-elevated p-4">
            <p className="text-sm font-semibold text-slate-800">Geral (histórico)</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ResumoMetric
                label="% de acerto"
                value={loadingGeral ? '...' : formatPercent(resumoGeral.percentual)}
                valueClassName="text-[#3d6b0f]"
              />
              <ResumoMetric
                label="Acertos"
                value={loadingGeral ? '...' : resumoGeral.acertos}
              />
              <ResumoMetric
                label="Erros"
                value={loadingGeral ? '...' : resumoGeral.erros}
                valueClassName="text-rose-600"
              />
              <ResumoMetric
                label="Questões respondidas"
                value={loadingGeral ? '...' : resumoGeral.respondidas}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Onde focar agora</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Priorize os assuntos com menor acerto para ganhar pontos mais rápido.
        </p>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            Onde focar agora
          </p>
          <div className="mt-3 space-y-3">
            {loadingAnalytics ? (
              <p className="text-sm text-slate-600">Carregando prioridades...</p>
            ) : prioridades.length === 0 ? (
              <p className="text-sm text-slate-600">
                Responda mais questões para receber prioridades de revisão.
              </p>
            ) : (
              <div className="space-y-2">
                {prioridades.map((item) => (
                  <div
                    key={item.nome}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p className="text-sm font-medium text-slate-900">{item.nome}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Acerto atual: {formatPercent(item.percentual_acerto)} ({item.total_questoes}{' '}
                      questões)
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button asChild className="btn-editorial-primary w-full py-3">
              <Link
                href="/simulados/novo"
                className="inline-flex items-center justify-center gap-2"
                onClick={() =>
                  trackSimuladoAnalyticsEvent('quick_action_train_now', {
                    origem: 'simulados_simple',
                  })
                }
              >
                <ClipboardList className="h-4 w-4" aria-hidden />
                Treinar agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Sua tendência na semana</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Leitura rápida para entender se você está melhorando.
        </p>
        <div className="card-elevated p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#8fe020]" aria-hidden />
            Sua tendência na semana
          </p>
          <div className="mt-3">
            {error ? (
              <p className="text-sm text-rose-600">{error}</p>
            ) : (
              <>
                <div className="inline-flex flex-col gap-1 rounded-lg border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.08)] px-4 py-2">
                  <span className="text-[15px] font-bold text-[#3d6b0f]">{trend.label}</span>
                  <span className="text-[11px] text-slate-600">{trend.detail}</span>
                </div>
                {evolucao.length > 0 ? (
                  <p className="mt-3 text-[11px] text-slate-600">
                    Última atualização: {formatDateLabel(evolucao[evolucao.length - 1]?.data_ref ?? '')}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
