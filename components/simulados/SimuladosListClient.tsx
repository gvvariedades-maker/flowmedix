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
import { SimuladosHeader } from '@/components/simulados/SimuladosHeader';
import { Button } from '@/components/ui/button';
import { NeonBadge } from '@/components/ui/neon-badge';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import type { SimuladoHubOpenSession, SimuladoHubSessionItem } from '@/lib/simulado/hubLoad';
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

function modoLabel(modo: 'treino' | 'prova'): string {
  return modo === 'prova' ? 'Prova' : 'Treino';
}

type SimuladosListClientProps = {
  openSession: SimuladoHubOpenSession | null;
  recentSessions: SimuladoHubSessionItem[];
};

export function SimuladosListClient({ openSession, recentSessions }: SimuladosListClientProps) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const isEmpty = !openSession && recentSessions.length === 0;

  return (
    <div className={cn('min-h-screen bg-[#010409]', pageBottomPadding)}>
      <div className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.08)] bg-[#010409]/95 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md supports-[backdrop-filter]:bg-[#010409]/90">
        <SimuladosHeader />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10 md:pt-8">
        {isEmpty ? (
          <SimuladosEmptyState />
        ) : (
          <div className="space-y-8">
            {openSession ? (
              <section aria-labelledby="simulado-em-andamento-heading">
                <h2
                  id="simulado-em-andamento-heading"
                  className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400/90"
                >
                  Em andamento
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[#00f2ff]/25 bg-gradient-to-b from-[#00f2ff]/[0.08] to-[#0d1117] p-5 shadow-sm shadow-black/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#00f2ff]/30 bg-[#00f2ff]/10">
                        <Play className="h-5 w-5 text-[#00f2ff]" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-white">Simulado em andamento</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <NeonBadge variant="brand">{modoLabel(openSession.modo)}</NeonBadge>
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                            <Layers className="h-3.5 w-3.5" aria-hidden />
                            {openSession.total_questoes}{' '}
                            {openSession.total_questoes === 1 ? 'questão' : 'questões'}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {tempoRelativo(openSession.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="h-11 w-full rounded-xl bg-[#00f2ff] text-sm font-bold text-[#010409] hover:bg-[#00f2ff]/90 sm:w-auto"
                    >
                      <Link href={`/simulados/${openSession.id}`}>Continuar simulado</Link>
                    </Button>
                  </div>
                </motion.div>
              </section>
            ) : null}

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
                    href="/desempenho/simulados"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400/90 hover:text-cyan-300"
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
                          'flex flex-col gap-3 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-4',
                          'transition-colors hover:border-white/15 hover:bg-[#111827]',
                          'sm:flex-row sm:items-center sm:justify-between',
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white">
                              Simulado · {modoLabel(session.modo)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
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
                        <span className="text-xs font-semibold text-cyan-400/90 sm:shrink-0">
                          Ver resumo →
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!openSession && recentSessions.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-600" aria-hidden />
                <p className="text-sm text-slate-400">Pronto para mais uma rodada?</p>
                <Button asChild className="mt-4 rounded-xl bg-cyan-500 font-semibold text-white hover:bg-cyan-600">
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
