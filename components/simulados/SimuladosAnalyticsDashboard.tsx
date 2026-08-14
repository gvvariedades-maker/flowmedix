'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, ClipboardList, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPI_VALUE_CLASS } from '@/components/ui/score-card';
import { cn } from '@/lib/utils';
import { getSimuladoAnalytics, SimuladoApiError } from '@/lib/simulado/client';
import { createRequestTimer, trackSimuladoAnalyticsEvent } from '@/lib/simulado/analyticsTelemetry';
import type { SimuladoAnalyticsResponse } from '@/lib/simulado/types';
import {
  SIMULADO_MIN_SAMPLE,
  type SimuladoAnalyticsMode,
  type SimuladoAnalyticsPeriod,
} from '@/lib/simulado/analyticsSummary';

const PERIODOS = [
  { value: '1d', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
] as const satisfies ReadonlyArray<{ value: SimuladoAnalyticsPeriod; label: string }>;

type SimuladoDimensionFilters = {
  banca: string | null;
  topico: string | null;
  subtopico: string | null;
};

const DIMENSION_LABELS: Record<keyof SimuladoDimensionFilters, string> = {
  banca: 'Banca',
  topico: 'Tópico',
  subtopico: 'Subtópico',
};

/**
 * Preserva as dimensões aplicadas ao trocar de período.
 * A UI só oferece período, mas banca/tópico/subtópico chegam por deep link
 * (ex.: do resultado de um simulado) e continuam valendo ponta a ponta.
 */
function buildFilterHref(
  periodo: SimuladoAnalyticsPeriod,
  dimensoes: SimuladoDimensionFilters,
): string {
  const params = new URLSearchParams();
  params.set('periodo', periodo);
  // Modo Treino escondido na UI — analytics agrega todos (inclui sessões legado).
  params.set('modo', 'todos');
  if (dimensoes.banca) params.set('banca', dimensoes.banca);
  if (dimensoes.topico) params.set('topico', dimensoes.topico);
  if (dimensoes.subtopico) params.set('subtopico', dimensoes.subtopico);
  return `/desempenho/simulados?${params.toString()}`;
}

/** Href sem uma das dimensões (chip “remover filtro”). */
function buildRemoveDimensionHref(
  periodo: SimuladoAnalyticsPeriod,
  dimensoes: SimuladoDimensionFilters,
  remover: keyof SimuladoDimensionFilters,
): string {
  return buildFilterHref(periodo, { ...dimensoes, [remover]: null });
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

/** Fração da amostra — `30/52 questões`. */
function formatFracao(acertos: number, respondidas: number): string | null {
  if (respondidas <= 0) return null;
  return `${acertos}/${respondidas} questões`;
}

function formatDateLabel(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

/** Pontos mínimos para comparar dois blocos de 3 dias sem inventar tendência. */
const TREND_MIN_POINTS = 4;

function getTrendLabel(values: Array<number | null>): {
  label: 'Melhorando' | 'Estável' | 'Atenção' | 'Tendência ainda indisponível';
  detail: string;
} {
  const cleanValues = values.filter((value): value is number => typeof value === 'number');
  if (cleanValues.length < TREND_MIN_POINTS) {
    const faltam = TREND_MIN_POINTS - cleanValues.length;
    return {
      // "Estável" com 1 ponto seria conclusão sem base — o estado é ausência de leitura.
      label: 'Tendência ainda indisponível',
      detail: `Faltam ${faltam} ${faltam === 1 ? 'dia' : 'dias'} com simulado para comparar.`,
    };
  }

  const recentSlice = cleanValues.slice(-3);
  const previousSlice = cleanValues.slice(-6, -3);
  if (recentSlice.length === 0 || previousSlice.length === 0) {
    return {
      label: 'Tendência ainda indisponível',
      detail: 'Continue respondendo para comparar dois períodos.',
    };
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

type KpiValueTone = 'brand' | 'success' | 'warning' | 'danger' | 'muted' | 'default';

const KPI_VALUE_TONE_CLASSES: Record<KpiValueTone, string> = {
  brand: 'text-[var(--color-brand-text)]',
  success: 'text-[var(--color-success-text)]',
  warning: 'text-[var(--color-warning-text)]',
  danger: 'text-[var(--color-danger-text)]',
  muted: 'text-slate-400',
  default: 'text-slate-900',
};

/**
 * Cor do acerto só depois da amostra mínima.
 * `0%` nunca ganha tom positivo; abaixo do piso fica neutro.
 */
function acertoTone(percentual: number | null, respondidas: number): KpiValueTone {
  if (percentual === null || respondidas < SIMULADO_MIN_SAMPLE) return 'default';
  if (percentual < 50) return 'danger';
  if (percentual < 70) return 'warning';
  return 'success';
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">{children}</p>
  );
}

/** Placeholder de carregamento — sem pulsar quando o usuário pede menos movimento. */
function ValueSkeleton({ className }: { className?: string }) {
  return (
    <span
      data-testid="simulados-skeleton"
      className={cn(
        'mt-1 block h-6 w-16 rounded bg-slate-200 motion-safe:animate-pulse',
        className,
      )}
      aria-hidden
    />
  );
}

function ResumoMetric({
  label,
  value,
  loading,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: string | number;
  loading: boolean;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      {loading ? (
        <ValueSkeleton className="h-6 w-14" />
      ) : (
        <p className={cn('mt-1', KPI_VALUE_CLASS, valueClassName)}>{value}</p>
      )}
    </div>
  );
}

function KpiMetricCard({
  label,
  value,
  hint,
  loading,
  valueTone,
}: {
  label: string;
  value: string;
  hint?: string | null;
  loading: boolean;
  valueTone: KpiValueTone;
}) {
  return (
    <div className="metric-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      {loading ? (
        <ValueSkeleton />
      ) : (
        <p className={cn('mt-1', KPI_VALUE_CLASS, KPI_VALUE_TONE_CLASSES[valueTone])}>{value}</p>
      )}
      {!loading && hint ? <p className="mt-1 text-[11px] text-slate-600">{hint}</p> : null}
    </div>
  );
}

const FILTER_PILL_ACTIVE =
  'border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] text-[var(--color-brand-text)]';
const FILTER_PILL_INACTIVE =
  'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50';

export function SimuladosAnalyticsDashboard({
  periodoAtual,
  modoAtual,
  bancaAtual,
  topicoAtual,
  subtopicoAtual,
}: {
  periodoAtual: SimuladoAnalyticsPeriod;
  modoAtual: SimuladoAnalyticsMode;
  bancaAtual: string | null;
  topicoAtual: string | null;
  subtopicoAtual: string | null;
}) {
  const [data, setData] = useState<SimuladoAnalyticsResponse | null>(null);
  const [dataGeral, setDataGeral] = useState<SimuladoAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingGeral, setLoadingGeral] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const dimensoes = useMemo<SimuladoDimensionFilters>(
    () => ({ banca: bancaAtual, topico: topicoAtual, subtopico: subtopicoAtual }),
    [bancaAtual, topicoAtual, subtopicoAtual],
  );

  const dimensoesAtivas = useMemo(
    () =>
      (Object.keys(DIMENSION_LABELS) as Array<keyof SimuladoDimensionFilters>)
        .filter((chave) => dimensoes[chave])
        .map((chave) => ({ chave, valor: dimensoes[chave] as string })),
    [dimensoes],
  );

  const tentarNovamente = useCallback(() => {
    setLoadingAnalytics(true);
    setError(null);
    setTentativa((n) => n + 1);
  }, []);

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
    // Envia todas as dimensões suportadas — filtro exibido e filtro aplicado batem.
    getSimuladoAnalytics({
      periodo: periodoAtual,
      modo: modoAtual,
      banca: dimensoes.banca ?? undefined,
      topico: dimensoes.topico ?? undefined,
      subtopico: dimensoes.subtopico ?? undefined,
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
        // Erro não vira zero: mantemos `data` anterior nulo e mostramos alerta + retry.
        setData(null);
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
  }, [periodoAtual, modoAtual, dimensoes, tentativa]);

  useEffect(() => {
    let mounted = true;
    getSimuladoAnalytics({
      periodo: '12m',
      modo: 'todos',
      banca: dimensoes.banca ?? undefined,
      topico: dimensoes.topico ?? undefined,
      subtopico: dimensoes.subtopico ?? undefined,
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
  }, [dimensoes, tentativa]);

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
    const bySubtopico = data?.desempenho.por_subtopico ?? [];
    const byTopico = data?.desempenho.por_topico ?? [];
    const source = bySubtopico.length > 0 ? bySubtopico : byTopico;
    // Mesmo piso de amostra do hub de Estudo: nada de ranquear com 1–2 questões.
    return [...source]
      .filter((item) => item.total_questoes >= SIMULADO_MIN_SAMPLE)
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

  const amostraComparavel =
    resumoPeriodo.respondidas >= SIMULADO_MIN_SAMPLE &&
    resumoGeral.respondidas >= SIMULADO_MIN_SAMPLE;

  const deltaPontosPercentuais = useMemo(() => {
    if (!amostraComparavel) return null;
    if (typeof resumoPeriodo.percentual !== 'number' || typeof resumoGeral.percentual !== 'number') return null;
    return resumoPeriodo.percentual - resumoGeral.percentual;
  }, [amostraComparavel, resumoGeral.percentual, resumoPeriodo.percentual]);

  const deltaMensagem = useMemo(() => {
    if (deltaPontosPercentuais === null) {
      return `Comparação liberada a partir de ${SIMULADO_MIN_SAMPLE} questões em cada recorte.`;
    }
    const deltaAbs = Math.round(Math.abs(deltaPontosPercentuais));
    if (deltaAbs === 0) return 'No período, você está igual à sua média de 12 meses.';
    if (deltaPontosPercentuais > 0) {
      return `No período, você está ${deltaAbs} p.p. acima da sua média de 12 meses.`;
    }
    return `No período, você está ${deltaAbs} p.p. abaixo da sua média de 12 meses.`;
  }, [deltaPontosPercentuais]);

  const mediaAcertoRespondidas = kpis?.questoes_concluidas ?? 0;
  const tempoMedioValor = formatDuration(kpis?.tempo_medio_ms);

  const resumoSectionTitle =
    periodoAtual === '1d' ? 'Seu desempenho hoje' : 'Seu desempenho no período';
  const resumoSectionHint =
    periodoAtual === '1d'
      ? 'Simulados concluídos hoje (horário de Brasília).'
      : 'Acerto ponderado por questões — simulados curtos não pesam igual aos longos.';

  return (
    <div
      className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:px-8 md:pt-8"
      data-desempenho-hub="simulados"
    >
      <div className="metric-card p-4">
        <p className="text-[11px] text-slate-600">
          Escolha o período para uma leitura rápida do seu desempenho.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">Período</p>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((periodo) => (
                <Link
                  key={periodo.value}
                  href={buildFilterHref(periodo.value, dimensoes)}
                  aria-current={periodoAtual === periodo.value ? 'true' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-lg border px-3 text-sm transition-colors',
                    periodoAtual === periodo.value ? FILTER_PILL_ACTIVE : FILTER_PILL_INACTIVE,
                  )}
                >
                  {periodo.label}
                </Link>
              ))}
            </div>
          </div>

          {dimensoesAtivas.length > 0 ? (
            <div role="group" aria-label="Filtros aplicados">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">
                Filtros aplicados
              </p>
              <div className="flex flex-wrap gap-2">
                {dimensoesAtivas.map(({ chave, valor }) => (
                  <Link
                    key={chave}
                    href={buildRemoveDimensionHref(periodoAtual, dimensoes, chave)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] px-3 text-sm text-slate-900"
                  >
                    {DIMENSION_LABELS[chave]}: {valor}
                    <X className="h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only">Remover filtro de {DIMENSION_LABELS[chave]}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div role="alert" className="metric-card flex flex-col gap-3 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-[var(--color-danger-text)]" aria-hidden />
            {error}
          </p>
          <p className="text-[11px] text-slate-600">
            Seus simulados continuam salvos — apenas a leitura falhou agora.
          </p>
          <Button
            type="button"
            onClick={tentarNovamente}
            className="btn-editorial-primary min-h-11 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section>
        <SectionLabel>{resumoSectionTitle}</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">{resumoSectionHint}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiMetricCard
            label="Simulados concluídos"
            value={String(kpis?.total_simulados ?? 0)}
            loading={loadingAnalytics}
            valueTone="brand"
          />
          <KpiMetricCard
            label="Acerto no período"
            value={
              mediaAcertoRespondidas >= SIMULADO_MIN_SAMPLE
                ? formatPercent(kpis?.media_acerto)
                : (formatFracao(kpis?.acertos_concluidos ?? 0, mediaAcertoRespondidas) ?? '--')
            }
            hint={
              mediaAcertoRespondidas >= SIMULADO_MIN_SAMPLE
                ? formatFracao(kpis?.acertos_concluidos ?? 0, mediaAcertoRespondidas)
                : mediaAcertoRespondidas > 0
                  ? `Amostra pequena — % a partir de ${SIMULADO_MIN_SAMPLE} questões.`
                  : 'Sem simulado concluído no período.'
            }
            loading={loadingAnalytics}
            valueTone={acertoTone(kpis?.media_acerto ?? null, mediaAcertoRespondidas)}
          />
          <KpiMetricCard
            label="Questões respondidas"
            value={String(evolucao.reduce((sum, item) => sum + item.total_questoes, 0))}
            loading={loadingAnalytics}
            valueTone="default"
          />
          <KpiMetricCard
            label="Tempo médio por questão"
            value={tempoMedioValor}
            loading={loadingAnalytics}
            valueTone={tempoMedioValor === '--' ? 'muted' : 'default'}
          />
        </div>
      </section>

      <section>
        <SectionLabel>Resumo comparativo</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Mesmo formato do resultado final do simulado: período atual e últimos 12 meses.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="metric-card p-4">
            <p className="text-sm font-semibold text-slate-800">No período</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ResumoMetric
                label="% de acerto"
                value={
                  resumoPeriodo.respondidas >= SIMULADO_MIN_SAMPLE
                    ? formatPercent(resumoPeriodo.percentual)
                    : (formatFracao(resumoPeriodo.acertos, resumoPeriodo.respondidas) ?? '--')
                }
                loading={loadingAnalytics}
                valueClassName={
                  KPI_VALUE_TONE_CLASSES[
                    acertoTone(resumoPeriodo.percentual, resumoPeriodo.respondidas)
                  ]
                }
              />
              <ResumoMetric
                label="Acertos"
                value={resumoPeriodo.acertos}
                loading={loadingAnalytics}
              />
              <ResumoMetric
                label="Erros"
                value={resumoPeriodo.erros}
                loading={loadingAnalytics}
                valueClassName="text-[var(--color-danger-text)]"
              />
              <ResumoMetric
                label="Questões respondidas"
                value={resumoPeriodo.respondidas}
                loading={loadingAnalytics}
              />
            </div>
          </div>

          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-600 sm:col-span-2">
            {deltaMensagem}
          </p>

          <div className="metric-card p-4">
            <p className="text-sm font-semibold text-slate-800">Últimos 12 meses</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ResumoMetric
                label="% de acerto"
                value={
                  resumoGeral.respondidas >= SIMULADO_MIN_SAMPLE
                    ? formatPercent(resumoGeral.percentual)
                    : (formatFracao(resumoGeral.acertos, resumoGeral.respondidas) ?? '--')
                }
                loading={loadingGeral}
                valueClassName={
                  KPI_VALUE_TONE_CLASSES[acertoTone(resumoGeral.percentual, resumoGeral.respondidas)]
                }
              />
              <ResumoMetric label="Acertos" value={resumoGeral.acertos} loading={loadingGeral} />
              <ResumoMetric
                label="Erros"
                value={resumoGeral.erros}
                loading={loadingGeral}
                valueClassName="text-[var(--color-danger-text)]"
              />
              <ResumoMetric
                label="Questões respondidas"
                value={resumoGeral.respondidas}
                loading={loadingGeral}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Onde focar agora</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Assuntos com pelo menos {SIMULADO_MIN_SAMPLE} questões e menor acerto.
        </p>
        <div className="metric-card p-4">
          <div className="space-y-3">
            {loadingAnalytics ? (
              <ValueSkeleton className="h-16 w-full" />
            ) : prioridades.length === 0 ? (
              <p className="text-sm text-slate-600">
                Ainda sem assunto com {SIMULADO_MIN_SAMPLE} questões no período — pratique mais para
                receber prioridades confiáveis.
              </p>
            ) : (
              <div className="space-y-2">
                {prioridades.map((item) => (
                  <div key={item.nome} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">{item.nome}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {formatPercent(item.percentual_acerto)} ·{' '}
                      {formatFracao(item.acertos, item.total_questoes)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button asChild className="btn-editorial-primary min-h-11 w-full">
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
        <SectionLabel>Sua tendência</SectionLabel>
        <p className="mb-3 text-[11px] text-slate-600">
          Compara os 3 dias mais recentes com os 3 anteriores.
        </p>
        <div className="metric-card p-4">
          {loadingAnalytics ? (
            <ValueSkeleton className="h-12 w-40" />
          ) : (
            <>
              <div className="inline-flex flex-col gap-1 rounded-lg border border-[var(--color-brand-ring)] bg-[var(--color-brand-wash)] px-4 py-2">
                <span className="text-[15px] font-bold text-[var(--color-brand-text)]">
                  {trend.label}
                </span>
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
      </section>
    </div>
  );
}
