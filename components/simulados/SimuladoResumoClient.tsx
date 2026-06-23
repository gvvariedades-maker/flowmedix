'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  RotateCcw,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { SimuladosBackLink } from '@/components/simulados/SimuladosBackLink';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { NeonBadge } from '@/components/ui/neon-badge';
import type {
  SimuladoConclusaoIncentivos,
  SimuladoProvaEvolucaoItem,
  SimuladoQuestaoItem,
  SimuladoResumo,
  SimuladoSessionSummary,
  WeeklyMissionEvolution,
} from '@/lib/simulado/types';
import { isSimuladoQuestaoRespondida } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';
import {
  buildRetryTitulo,
  evaluateProvaTempoVsMeta,
  secondsPerQuestionToRitmo,
  sessionDisplayTitulo,
} from '@/lib/simulado/provaMeta';
import { createSimuladoSession, getSimuladoProvaEvolucao, SimuladoApiError } from '@/lib/simulado/client';
import { SimuladoMobileActionBar } from '@/components/simulados/SimuladoMobileActionBar';
import { DiagnosticoEixos } from '@/components/simulados/DiagnosticoEixos';
import { ConclusaoIncentivosBanner } from '@/components/simulados/ConclusaoIncentivosBanner';
import { DiagnosticoConclusaoHeader } from '@/components/simulados/DiagnosticoConclusaoHeader';
import { WeeklyMissionConclusaoHeader } from '@/components/simulados/WeeklyMissionConclusaoHeader';
import { WeeklyMissionEvolutionPanel } from '@/components/simulados/WeeklyMissionEvolution';
import {
  isAdaptiveSimuladoKind,
  resolveSimuladoSessionKind,
} from '@/lib/simulado/sessionKind';

type SimuladoResumoClientProps = {
  session: SimuladoSessionSummary;
  resumo: SimuladoResumo;
  questoes: SimuladoQuestaoItem[];
  incentivos?: SimuladoConclusaoIncentivos | null;
  weeklyEvolution?: WeeklyMissionEvolution | null;
  weeklyOrdinal?: number | null;
};

function metaLinha(meta: SimuladoQuestaoItem['meta']): string {
  const parts = [meta.topico, meta.subtopico].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Questão';
}

function summarizeFiltros(filtros: Record<string, unknown>): string | null {
  const bancas = Array.isArray(filtros.bancas) ? (filtros.bancas as string[]) : null;
  const assuntos = Array.isArray(filtros.assuntos) ? (filtros.assuntos as string[]) : null;
  const parts: string[] = [];
  if (bancas?.length === 1) parts.push(bancas[0]!);
  else if (bancas && bancas.length > 1) parts.push(`${bancas.length} bancas`);
  if (assuntos?.length === 1) parts.push(assuntos[0]!);
  else if (assuntos && assuntos.length > 1) parts.push(`${assuntos.length} assuntos`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function formatOpcaoId(id: string | null | undefined): string {
  if (!id) return '—';
  const trimmed = id.trim();
  if (/^[a-z]$/i.test(trimmed)) return trimmed.toUpperCase();
  return trimmed;
}

function QuestaoRevisaoItem({ item }: { item: SimuladoQuestaoItem }) {
  const respondida = isSimuladoQuestaoRespondida(item);

  return (
    <li
      className={cn(
        'rounded-2xl border p-4 backdrop-blur-xl transition-colors',
        respondida
          ? item.acertou
            ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
            : 'border-rose-500/25 bg-rose-500/[0.06]'
          : 'border-slate-200 bg-white',
      )}
    >
      <div className="flex items-start gap-3">
        {respondida ? (
          item.acertou ? (
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
              aria-hidden
            />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden />
          )
        ) : (
          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" aria-hidden />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">#{item.ordem}</span>
            {item.meta.banca && (
              <NeonBadge variant="brand" className="text-[10px]">
                {item.meta.banca}
              </NeonBadge>
            )}
            <span
              className={cn(
                'text-xs font-medium',
                respondida
                  ? item.acertou
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : 'text-slate-500',
              )}
            >
              {respondida ? (item.acertou ? 'Acertou' : 'Errou') : 'Não respondida'}
            </span>
          </div>

          <p className="text-sm text-slate-800">{metaLinha(item.meta)}</p>

          {respondida && (
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-500">Sua resposta:</dt>
                <dd className="font-mono font-medium text-slate-800">
                  {formatOpcaoId(item.opcao_id)}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-500">Gabarito:</dt>
                <dd
                  className={cn(
                    'font-mono font-medium',
                    item.acertou ? 'text-emerald-400/90' : 'text-emerald-400/90',
                  )}
                >
                  {formatOpcaoId(item.opcao_correta_id)}
                </dd>
              </div>
            </dl>
          )}

          <div className="mt-3">
            <Link
              href={`/estudar/${item.modulo_slug}`}
              className="link-editorial-secondary inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              {respondida ? 'Revisar no estudo reverso' : 'Abrir questão'}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export function SimuladoResumoClient({
  session,
  resumo,
  questoes,
  incentivos,
  weeklyEvolution,
  weeklyOrdinal,
}: SimuladoResumoClientProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'todos' | 'erros' | 'acertos'>('todos');
  const [retryingErrors, setRetryingErrors] = useState(false);
  const [retryingSession, setRetryingSession] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [evolucao, setEvolucao] = useState<SimuladoProvaEvolucaoItem[]>([]);
  const [evolucaoLoading, setEvolucaoLoading] = useState(false);
  const sessionKind = resolveSimuladoSessionKind(session.filtros);
  const isAdaptive = isAdaptiveSimuladoKind(sessionKind);
  const isWeekly = sessionKind === 'weekly';
  const dataConclusao = session.concluida_em ?? session.created_at;
  const dataFormatada = new Date(dataConclusao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const tituloExibicao = sessionDisplayTitulo(session.titulo, session.modo, {
    weeklyOrdinal: isWeekly ? weeklyOrdinal : undefined,
  });
  const filtrosResumo = summarizeFiltros(session.filtros);
  const modoLabel = session.modo === 'prova' ? 'Prova' : 'Treino';
  const resumoDescription = [
    modoLabel,
    `${session.total_questoes} questões`,
    dataFormatada,
    filtrosResumo,
  ]
    .filter(Boolean)
    .join(' · ');

  const ringVariant = resumo.percentual_acerto >= 70 ? 'success' : 'brand';

  const liveSummary = useMemo(() => {
    return `Simulado concluído. ${resumo.percentual_acerto}% de acerto. ${resumo.acertos} acertos e ${resumo.erros} erros em ${resumo.respondidas} questões respondidas.`;
  }, [resumo]);

  const isProva = session.modo === 'prova';
  const showProvaEvolucao = isProva && !isAdaptive;

  useEffect(() => {
    if (!showProvaEvolucao || !session.titulo.trim()) {
      setEvolucao([]);
      return;
    }

    let cancelled = false;
    async function loadEvolucao() {
      setEvolucaoLoading(true);
      try {
        const response = await getSimuladoProvaEvolucao(session.titulo, 5);
        if (!cancelled) setEvolucao(response.items);
      } catch {
        if (!cancelled) setEvolucao([]);
      } finally {
        if (!cancelled) setEvolucaoLoading(false);
      }
    }

    void loadEvolucao();
    return () => {
      cancelled = true;
    };
  }, [showProvaEvolucao, session.titulo]);

  const provaTempo = useMemo(
    () =>
      evaluateProvaTempoVsMeta(
        resumo.tempo_total_ms || 0,
        session.total_questoes,
        session.ritmo_meta_segundos_por_questao,
      ),
    [resumo.tempo_total_ms, session.total_questoes, session.ritmo_meta_segundos_por_questao],
  );
  const metricCols = resumo.pendentes > 0 ? 4 : 3;
  const tempoTotalMin = Math.round((resumo.tempo_total_ms || 0) / 60000);
  const tempoMedioSeg = Math.round((resumo.tempo_medio_ms || 0) / 1000);
  const retryTituloSugerido = buildRetryTitulo(session.titulo);
  const questoesFiltradas = useMemo(() => {
    if (filtro === 'todos') return questoes;
    return questoes.filter((item) => {
      if (!isSimuladoQuestaoRespondida(item)) return false;
      return filtro === 'erros' ? !item.acertou : item.acertou;
    });
  }, [filtro, questoes]);

  async function handleRetryErrors() {
    setRetryError(null);
    setRetryingErrors(true);
    try {
      const response = await createSimuladoSession({
        quantidade: Math.max(1, resumo.erros),
        modo: 'treino',
        from_session_id: session.id,
        only_errors: true,
        forcar_novo: true,
      });
      router.push(`/simulados/${response.session.id}`);
    } catch (error) {
      const message =
        error instanceof SimuladoApiError
          ? error.message
          : 'Não foi possível criar simulado com erros.';
      setRetryError(message);
    } finally {
      setRetryingErrors(false);
    }
  }

  async function handleRetrySession() {
    setRetryError(null);
    setRetryingSession(true);
    try {
      const response = await createSimuladoSession({
        quantidade: session.total_questoes,
        modo: session.modo,
        from_session_id: session.id,
        only_errors: false,
        forcar_novo: true,
        ...(isProva
          ? {
              titulo: retryTituloSugerido,
              ritmo_meta: secondsPerQuestionToRitmo(session.ritmo_meta_segundos_por_questao),
            }
          : {}),
      });
      router.push(`/simulados/${response.session.id}`);
    } catch (error) {
      const message =
        error instanceof SimuladoApiError
          ? error.message
          : 'Não foi possível refazer este simulado.';
      setRetryError(message);
    } finally {
      setRetryingSession(false);
    }
  }

  const retryBusy = retryingErrors || retryingSession;
  const refazerLabel = isProva ? 'Novo simulado com mesmos filtros' : 'Refazer simulado';

  const adaptiveActionButtons = (
    <>
      <Button
        asChild
        className="btn-editorial-primary h-12 w-full sm:w-auto"
      >
        <Link href="/estudar">Voltar à vitrine</Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="btn-editorial-outline h-12 w-full sm:w-auto"
      >
        <Link href="/simulados/novo">
          <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
          Criar simulado livre
        </Link>
      </Button>
    </>
  );

  const livreActionButtons = (
    <>
      <Button
        type="button"
        onClick={() => void handleRetrySession()}
        disabled={retryBusy}
        className="btn-editorial-primary h-12 w-full disabled:opacity-50 sm:w-auto"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
        {retryingSession ? 'Criando...' : refazerLabel}
      </Button>
      <Button
        type="button"
        onClick={() => void handleRetryErrors()}
        disabled={retryBusy || resumo.erros === 0}
        className="btn-editorial-outline h-12 w-full disabled:opacity-50 sm:w-auto"
      >
        <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
        {retryingErrors ? 'Criando...' : 'Refazer só erros'}
      </Button>
      <Button
        asChild
        variant="outline"
        className="btn-editorial-outline h-12 w-full sm:w-auto"
      >
        <Link href="/simulados/novo">
          <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
          Novo simulado
        </Link>
      </Button>
    </>
  );

  const actionButtons = isAdaptive ? adaptiveActionButtons : livreActionButtons;

  return (
    <div className="bg-background px-4 pt-6 sm:px-6 lg:px-8 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveSummary}
        </p>

        <SimuladosBackLink className="mb-3" />

        <PageHeader
          title={tituloExibicao}
          description={resumoDescription}
          descriptionClassName="mt-1 text-sm text-slate-500"
          titleClassName="text-editorial-title text-2xl"
          action={
            isAdaptive ? (
              <Button
                asChild
                variant="outline"
                className="btn-editorial-outline hidden sm:inline-flex"
              >
                <Link href="/simulados/novo">Criar simulado livre</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className="btn-editorial-outline hidden sm:inline-flex"
              >
                <Link href="/simulados/novo">Novo simulado</Link>
              </Button>
            )
          }
        />

        {isWeekly ? (
          <WeeklyMissionConclusaoHeader weeklyOrdinal={weeklyOrdinal} />
        ) : null}

        {sessionKind === 'diagnostico' ? <DiagnosticoConclusaoHeader /> : null}

        {isProva ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-elevated-lg space-y-3 p-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4 shrink-0 text-[#166534]" aria-hidden />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Tempo</h2>
              </div>
              <p className="text-2xl font-bold text-slate-900">{provaTempo.tempoLabel}</p>
              {provaTempo.metaLabel ? (
                <p className="text-sm text-slate-600">
                  Meta sugerida:{' '}
                  <span className="font-medium text-slate-800">{provaTempo.metaLabel}</span>
                </p>
              ) : null}
              <p
                className={cn(
                  'text-sm font-semibold',
                  provaTempo.status === 'within'
                    ? 'text-emerald-400'
                    : provaTempo.status === 'above'
                      ? 'text-amber-400'
                      : 'text-slate-400',
                )}
              >
                {provaTempo.comparacaoLabel}
              </p>
              <p className="text-xs text-slate-600">
                Média por questão: {tempoMedioSeg}s · total {tempoTotalMin} min
              </p>
            </div>

            <div className="card-elevated-lg space-y-3 p-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Target className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Desempenho</h2>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={resumo.percentual_acerto}
                  size={88}
                  strokeWidth={8}
                  variant={ringVariant}
                />
                <div>
                  <p className="text-3xl font-bold text-slate-900">{resumo.percentual_acerto}%</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">de acerto</p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Acertos</dt>
                  <dd className="text-lg font-bold text-emerald-400">{resumo.acertos}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Erros</dt>
                  <dd className="text-lg font-bold text-rose-400">{resumo.erros}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Total</dt>
                  <dd className="text-lg font-bold text-slate-800">{resumo.respondidas}</dd>
                </div>
              </dl>
              {resumo.pendentes > 0 ? (
                <p className="text-xs text-amber-400">{resumo.pendentes} não respondida(s)</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="card-elevated-lg flex flex-col items-center gap-8 p-8 sm:flex-row sm:justify-between">
            <div className="relative flex flex-col items-center">
              <ProgressRing
                value={resumo.percentual_acerto}
                size={120}
                strokeWidth={10}
                variant={ringVariant}
              />
              <div
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                aria-hidden
              >
                <span className="text-2xl font-bold text-slate-900">{resumo.percentual_acerto}%</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  de acerto
                </span>
              </div>
            </div>

            <div
              className={cn(
                'grid w-full max-w-md gap-6 text-center',
                metricCols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4',
              )}
            >
              <div>
                <p className="text-2xl font-bold text-emerald-400">{resumo.acertos}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">Acertos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">{resumo.erros}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">Erros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{resumo.respondidas}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">Respondidas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#166534]">{tempoTotalMin}m</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">Tempo total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#166534]">{tempoMedioSeg}s</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">Média/questão</p>
              </div>
              {resumo.pendentes > 0 && (
                <div>
                  <p className="text-2xl font-bold text-amber-400">{resumo.pendentes}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Pendentes</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showProvaEvolucao && retryTituloSugerido !== session.titulo.trim() ? (
          <p className="text-center text-xs text-slate-500">
            Próxima tentativa sugerida:{' '}
            <span className="font-medium text-slate-400">{retryTituloSugerido}</span>
          </p>
        ) : null}

        {showProvaEvolucao && (evolucaoLoading || evolucao.length > 0) ? (
          <section
            aria-labelledby="simulado-evolucao-titulo"
            className="card-elevated-lg space-y-4 p-6"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 shrink-0 text-[#166534]" aria-hidden />
              <h2
                id="simulado-evolucao-titulo"
                className="text-sm font-semibold uppercase tracking-wider text-slate-400"
              >
                Evolução por nome
              </h2>
            </div>
            {evolucaoLoading ? (
              <p className="text-sm text-slate-500">Carregando histórico…</p>
            ) : (
              <ul className="space-y-2">
                {evolucao.map((item) => {
                  const dataRef = item.concluida_em ?? item.created_at;
                  const dataLabel = new Date(dataRef).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const isCurrent = item.id === session.id;

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm',
                        isCurrent
                          ? 'border-[rgba(34, 197, 94,0.35)] bg-[rgba(34, 197, 94,0.08)]'
                          : 'border-slate-200 bg-white',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {item.titulo || tituloExibicao}
                          {isCurrent ? (
                            <span className="ml-2 text-xs font-normal text-[#166534]">
                              (esta prova)
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-500">{dataLabel}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
                        <span className="font-semibold text-emerald-400">
                          {item.percentual_acerto != null ? `${item.percentual_acerto}%` : '—'}
                        </span>
                        <span className="text-slate-400">{item.tempo_label ?? '—'}</span>
                        {!isCurrent ? (
                          <Link
                            href={`/simulados/${item.id}`}
                            className="link-editorial-secondary font-medium"
                          >
                            Ver
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}

        {isWeekly && weeklyEvolution ? (
          <WeeklyMissionEvolutionPanel evolution={weeklyEvolution} />
        ) : null}

        <ConclusaoIncentivosBanner incentivos={incentivos} />

        {(incentivos || resumo.erros > 0) ? (
          <DiagnosticoEixos
            questoes={questoes}
            filtros={session.filtros}
            incentivos={incentivos}
          />
        ) : null}

        <section aria-labelledby="simulado-revisao-titulo">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2
              id="simulado-revisao-titulo"
              className="text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
              Revisão por questão
            </h2>
            <p className="text-xs text-slate-600">
              {questoesFiltradas.length} {questoesFiltradas.length === 1 ? 'item' : 'itens'}
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'erros', label: 'Só erros' },
              { id: 'acertos', label: 'Só acertos' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFiltro(item.id as typeof filtro)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-semibold',
                  filtro === item.id
                    ? 'border-[rgba(34, 197, 94,0.45)] bg-[rgba(34, 197, 94,0.12)] text-[#166534]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {questoesFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              Nenhuma questão para o filtro selecionado.
            </p>
          ) : (
            <ul className="space-y-3">
              {questoesFiltradas.map((item) => (
                <QuestaoRevisaoItem key={`${item.ordem}-${item.modulo_slug}`} item={item} />
              ))}
            </ul>
          )}
        </section>

        {retryError && !isAdaptive && (
          <p className="text-center text-sm text-rose-400" role="alert">
            {retryError}
          </p>
        )}

        <SimuladoMobileActionBar className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {actionButtons}
        </SimuladoMobileActionBar>
      </div>
    </div>
  );
}
