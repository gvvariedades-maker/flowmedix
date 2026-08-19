'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Layers,
  Play,
} from 'lucide-react';
import { SimuladosEmptyState } from '@/components/simulados/SimuladosEmptyState';
import { SimuladosHistoryLoadingSkeleton } from '@/components/simulados/SimuladosListLoadingSkeleton';
import { adaptiveContinueCtaLabel } from '@/components/simulados/AdaptiveSimuladoSessionChip';
import { Button } from '@/components/ui/button';
import { NeonBadge } from '@/components/ui/neon-badge';
import type { SimuladoHubOpenSession, SimuladoHubSessionItem } from '@/lib/simulado/hubLoad';
import { sessionDisplayTitulo } from '@/lib/simulado/provaMeta';
import type { SimuladoSessionKind } from '@/lib/simulado/sessionKind';
import { cn } from '@/lib/utils';

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86_400_000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `Há ${dias} dias`;
}

function formatPercent(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

/** Badge de modo só para sessões livres legadas em Treino (prova é o padrão atual). */
function modoBadgeIfLegacyTreino(modo: 'treino' | 'prova', className?: string) {
  if (modo !== 'treino') return null;
  return (
    <NeonBadge variant="brand" className={className}>
      Treino
    </NeonBadge>
  );
}

function sessionKindBadge(sessionKind: SimuladoSessionKind) {
  if (sessionKind === 'weekly') {
    return (
      <NeonBadge
        variant="neutral"
        className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700"
      >
        Missão
      </NeonBadge>
    );
  }

  if (sessionKind === 'diagnostico') {
    return <NeonBadge variant="violet">Diagnóstico</NeonBadge>;
  }

  return null;
}

type SimuladosListClientProps = {
  openSession: SimuladoHubOpenSession | null;
  recentSessions: SimuladoHubSessionItem[];
  /** False enquanto o P1 (histórico) ainda não chegou — não mostrar empty state. */
  historyReady?: boolean;
  /** Erro no P1: preserva P0 e skeleton dos recentes. */
  historyPending?: boolean;
};

export function SimuladosListClient({
  openSession,
  recentSessions,
  historyReady = true,
  historyPending = false,
}: SimuladosListClientProps) {
  const showEmptyState = historyReady && !historyPending && !openSession && recentSessions.length === 0;
  const showHistorySkeleton = (!historyReady || historyPending) && recentSessions.length === 0;

  return (
    <div
      data-simulados-hub="lista"
      data-simulados-enrichment={historyReady ? (historyPending ? 'error' : 'ready') : 'pending'}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        {showEmptyState ? (
          <SimuladosEmptyState />
        ) : (
          <div className="space-y-8">
            {openSession ? (
              <section aria-labelledby="simulado-em-andamento-heading">
                <h2
                  id="simulado-em-andamento-heading"
                  className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9A3412]"
                >
                  Em andamento
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[rgba(242,101,34,0.35)] bg-gradient-to-b from-[rgba(242,101,34,0.08)] to-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(242,101,34,0.35)] bg-[rgba(242,101,34,0.12)]">
                        <Play className="h-5 w-5 text-[#9A3412]" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900">
                          {sessionDisplayTitulo(openSession.titulo, openSession.modo)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {sessionKindBadge(openSession.session_kind)}
                          {openSession.session_kind === 'livre'
                            ? modoBadgeIfLegacyTreino(openSession.modo)
                            : null}
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                            <Layers className="h-3.5 w-3.5" aria-hidden />
                            {openSession.total_questoes}{' '}
                            {openSession.total_questoes === 1 ? 'questão' : 'questões'}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {tempoRelativo(openSession.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
                      <Link href={`/simulados/${openSession.id}`}>
                        {adaptiveContinueCtaLabel(openSession.session_kind)}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </section>
            ) : null}

            {showHistorySkeleton ? <SimuladosHistoryLoadingSkeleton /> : null}

            {recentSessions.length > 0 ? (
              <section aria-labelledby="simulados-recentes-heading">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2
                    id="simulados-recentes-heading"
                    className="text-xs font-semibold uppercase tracking-widest text-slate-500"
                  >
                    Concluídos recentemente
                  </h2>
                  <Link
                    href="/desempenho"
                    className="link-editorial-secondary inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                    Ver desempenho
                  </Link>
                </div>
                <ul className="space-y-3">
                  {recentSessions.map((session, index) => (
                    <motion.li
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="list-none"
                    >
                      <Link
                        href={`/simulados/${session.id}`}
                        className={cn(
                          'card-elevated flex flex-col gap-3 p-4 transition-colors hover:border-slate-300',
                          'sm:flex-row sm:items-center sm:justify-between',
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              {sessionDisplayTitulo(session.titulo, session.modo)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                              {sessionKindBadge(session.session_kind)}
                              {session.session_kind === 'livre'
                                ? modoBadgeIfLegacyTreino(session.modo, 'text-[10px]')
                                : null}
                              <span>{formatPercent(session.percentual_acerto)} acerto</span>
                              <span>
                                {session.total_questoes ?? '—'}{' '}
                                {(session.total_questoes ?? 0) === 1 ? 'questão' : 'questões'}
                              </span>
                              <span>
                                {tempoRelativo(session.concluida_em ?? session.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#9A3412] sm:shrink-0">
                          Ver resumo →
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!openSession && recentSessions.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden />
                <p className="text-sm text-slate-600">Pronto para mais uma rodada?</p>
                <Button asChild className="btn-editorial-primary mt-4">
                  <Link href="/simulados/novo">Montar novo simulado</Link>
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
