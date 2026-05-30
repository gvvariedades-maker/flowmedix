'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { SimuladosBackLink } from '@/components/simulados/SimuladosBackLink';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { NeonBadge } from '@/components/ui/neon-badge';
import type {
  SimuladoQuestaoItem,
  SimuladoResumo,
  SimuladoSessionSummary,
} from '@/lib/simulado/types';
import { isSimuladoQuestaoRespondida } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';
import { createSimuladoSession, SimuladoApiError } from '@/lib/simulado/client';
import {
  SimuladoMobileActionBar,
  SIMULADO_RESUMO_MOBILE_ACTION_SPACER,
} from '@/components/simulados/SimuladoMobileActionBar';

type SimuladoResumoClientProps = {
  session: SimuladoSessionSummary;
  resumo: SimuladoResumo;
  questoes: SimuladoQuestaoItem[];
};

function metaLinha(meta: SimuladoQuestaoItem['meta']): string {
  const parts = [meta.topico, meta.subtopico].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Questão';
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
          : 'border-white/10 bg-slate-900/60',
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

          <p className="text-sm text-slate-200">{metaLinha(item.meta)}</p>

          {respondida && (
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-slate-500">Sua resposta:</dt>
                <dd className="font-mono font-medium text-slate-200">
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
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400/90 transition-colors hover:text-cyan-300"
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

export function SimuladoResumoClient({ session, resumo, questoes }: SimuladoResumoClientProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'todos' | 'erros' | 'acertos'>('todos');
  const [retryingErrors, setRetryingErrors] = useState(false);
  const [retryingSession, setRetryingSession] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const dataConclusao = session.concluida_em ?? session.created_at;
  const dataFormatada = new Date(dataConclusao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const ringVariant = resumo.percentual_acerto >= 70 ? 'success' : 'brand';

  const liveSummary = useMemo(() => {
    return `Simulado concluído. ${resumo.percentual_acerto}% de acerto. ${resumo.acertos} acertos e ${resumo.erros} erros em ${resumo.respondidas} questões respondidas.`;
  }, [resumo]);

  const metricCols = resumo.pendentes > 0 ? 4 : 3;
  const tempoTotalMin = Math.round((resumo.tempo_total_ms || 0) / 60000);
  const tempoMedioSeg = Math.round((resumo.tempo_medio_ms || 0) / 1000);
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

  const actionButtons = (
    <>
      <Button
        type="button"
        onClick={() => void handleRetrySession()}
        disabled={retryBusy}
        className="h-12 w-full rounded-2xl bg-[#00f2ff] px-6 text-sm font-bold text-[#010409] hover:bg-[#00f2ff]/90 disabled:opacity-50 sm:w-auto"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
        {retryingSession ? 'Criando...' : 'Refazer simulado'}
      </Button>
      <Button
        type="button"
        onClick={() => void handleRetryErrors()}
        disabled={retryBusy || resumo.erros === 0}
        className="h-12 w-full rounded-2xl border border-cyan-500/40 bg-cyan-500/15 px-6 text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-50 sm:w-auto"
      >
        <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
        {retryingErrors ? 'Criando...' : 'Refazer só erros'}
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-12 w-full rounded-2xl border-white/15 bg-transparent px-6 text-slate-200 hover:bg-white/5 sm:w-auto"
      >
        <Link href="/simulados/novo">
          <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
          Novo simulado
        </Link>
      </Button>
    </>
  );

  return (
    <div className="bg-[#010409] px-4 pt-6 sm:px-6 lg:px-8 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveSummary}
        </p>

        <SimuladosBackLink className="mb-3" />

        <PageHeader
          title="Simulado concluído"
          description={`${session.total_questoes} questões · ${dataFormatada}`}
          descriptionClassName="text-sm text-slate-400 mt-1"
          titleClassName="text-2xl font-[1000] italic tracking-tighter text-white"
          action={
            <Button
              asChild
              variant="outline"
              className="hidden rounded-xl border-white/15 bg-transparent text-slate-200 hover:bg-white/5 sm:inline-flex"
            >
              <Link href="/simulados/novo">Novo simulado</Link>
            </Button>
          }
        />

        <div className="glass-panel flex flex-col items-center gap-8 border border-white/10 p-8 sm:flex-row sm:justify-between">
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
              <span className="text-2xl font-bold text-white">{resumo.percentual_acerto}%</span>
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
              <p className="text-2xl font-bold text-slate-200">{resumo.respondidas}</p>
              <p className="text-xs uppercase tracking-wider text-slate-500">Respondidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-300">{tempoTotalMin}m</p>
              <p className="text-xs uppercase tracking-wider text-slate-500">Tempo total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-300">{tempoMedioSeg}s</p>
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
                    ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                    : 'border-white/10 bg-white/[0.03] text-slate-300',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {questoesFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
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

        {retryError && (
          <p className="text-center text-sm text-rose-400" role="alert">
            {retryError}
          </p>
        )}

        <SimuladoMobileActionBar
          mobileSpacerClassName={SIMULADO_RESUMO_MOBILE_ACTION_SPACER}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          {actionButtons}
        </SimuladoMobileActionBar>
      </div>
    </div>
  );
}
