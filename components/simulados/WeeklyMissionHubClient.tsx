'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { WeeklyMissionEntitlement } from '@/lib/freemium/weeklyMissionEntitlement';
import { WeeklySimuladoMissionCard } from '@/components/vitrine/WeeklySimuladoMissionCard';
import { WeeklyMissionFreemiumPanel } from '@/components/simulados/WeeklyMissionFreemiumPanel';
import { WeeklyMissionEvolutionPanel } from '@/components/simulados/WeeklyMissionEvolution';
import { PageHeader } from '@/components/ui/page-header';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import type { WeeklyMissionHubData } from '@/lib/simulado/weeklyMissionHub';
import type { WeeklySimuladoMission } from '@/lib/simulado/types';
import { weeklySimuladoAlunoTitulo } from '@/lib/simulado/weeklyDisplayTitle';
import { cn } from '@/lib/utils';

type WeeklyMissionHubClientProps = {
  initialData: WeeklyMissionHubData;
};

function formatPercent(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

function formatConclusao(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function nextMissionLabel(weekEndsAt: string): string {
  const end = new Date(weekEndsAt);
  if (Number.isNaN(end.getTime())) return 'Próxima missão na segunda-feira';
  const next = new Date(end);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return `Próxima missão: ${next.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })}`;
}

export function WeeklyMissionHubClient({ initialData }: WeeklyMissionHubClientProps) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const [mission, setMission] = useState<WeeklySimuladoMission>(initialData.mission);

  const { history, semanas_consecutivas, weekly_evolution, entitlement } = initialData;
  const isCurrentInHistory = history.some((item) => item.id === mission.session_id);
  const showFreemiumPanel =
    !entitlement.allowed &&
    mission.status === 'ausente' &&
    !mission.session_id;

  return (
    <div className="bg-background">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10">
          <PageHeader
            title="Missão da semana"
            titleClassName="truncate text-3xl font-bold text-slate-900"
            description="Avaliação semanal personalizada — acompanhe sua evolução por disciplina"
            descriptionClassName="mt-1 text-sm text-slate-500"
            action={
              <Link
                href="/simulados"
                className="btn-editorial-outline inline-flex h-11 w-full items-center justify-center sm:w-auto"
              >
                <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
                Simulados livres
              </Link>
            }
          />
        </div>
      </div>

      <div
        className={cn(
          'mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 md:px-10 md:pt-8 md:pb-8',
          pageBottomPadding,
        )}
      >
        {showFreemiumPanel && !entitlement.allowed ? (
          <WeeklyMissionFreemiumPanel entitlement={entitlement} />
        ) : (
          <WeeklySimuladoMissionCard
            mission={mission}
            onMissionUpdate={setMission}
            entitlement={entitlement}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-elevated-lg flex items-start gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50">
              <TrendingUp className="h-5 w-5 text-cyan-700" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Streak de missões
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {semanas_consecutivas}{' '}
                <span className="text-base font-semibold text-slate-500">
                  {semanas_consecutivas === 1 ? 'semana' : 'semanas'}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Missões concluídas em sequência</p>
            </div>
          </div>

          <div className="card-elevated-lg flex items-start gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
              <CalendarClock className="h-5 w-5 text-emerald-700" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ciclo semanal
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {nextMissionLabel(mission.week_ends_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Cada missão é única — não pode ser refeita
              </p>
            </div>
          </div>
        </div>

        {weekly_evolution ? <WeeklyMissionEvolutionPanel evolution={weekly_evolution} /> : null}

        <section aria-labelledby="weekly-history-heading">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2
              id="weekly-history-heading"
              className="text-xs font-semibold uppercase tracking-widest text-slate-500"
            >
              Histórico de missões
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {history.length + (isCurrentInHistory ? 0 : mission.status === 'concluido' ? 1 : 0)}{' '}
              registros
            </span>
          </div>

          {history.length === 0 && mission.status !== 'concluido' ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Target className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden />
              <p className="text-sm text-slate-600">
                Conclua sua primeira missão para ver o histórico e a evolução por disciplina.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {mission.status === 'concluido' && mission.session_id && !isCurrentInHistory ? (
                <motion.li
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="list-none"
                >
                  <Link
                    href={`/simulados/${mission.session_id}`}
                    className="card-elevated flex flex-col gap-3 border-cyan-200/60 p-4 transition-colors hover:border-cyan-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <WeeklyHistoryRowContent
                      weeklyOrdinal={mission.weekly_ordinal ?? null}
                      percentual={mission.percentual_acerto}
                      total={mission.total_questoes}
                      concluidaEm={null}
                      current
                    />
                    <span className="text-xs font-semibold text-cyan-700 sm:shrink-0">
                      Ver resumo →
                    </span>
                  </Link>
                </motion.li>
              ) : null}

              {history.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="list-none"
                >
                  <Link
                    href={`/simulados/${item.id}`}
                    className="card-elevated flex flex-col gap-3 p-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <WeeklyHistoryRowContent
                      weeklyOrdinal={item.weekly_ordinal}
                      percentual={item.percentual_acerto}
                      total={item.total_questoes}
                      concluidaEm={item.concluida_em}
                    />
                    <span className="text-xs font-semibold text-[#9A3412] sm:shrink-0">
                      Ver resumo →
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-slate-500">
          Quer praticar sem avaliação?{' '}
          <Link href="/simulados/novo" className="link-editorial-secondary font-semibold">
            Monte um simulado livre
          </Link>
        </p>
      </div>
    </div>
  );
}

function WeeklyHistoryRowContent({
  weeklyOrdinal,
  percentual,
  total,
  concluidaEm,
  current = false,
}: {
  weeklyOrdinal: number | null;
  percentual: number | null;
  total: number | null;
  concluidaEm: string | null;
  current?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
          current ? 'border-cyan-200 bg-cyan-50' : 'border-emerald-200 bg-emerald-50',
        )}
      >
        <CheckCircle2
          className={cn('h-5 w-5', current ? 'text-cyan-700' : 'text-emerald-600')}
          aria-hidden
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">
          {weeklySimuladoAlunoTitulo(weeklyOrdinal)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
          {percentual != null ? <span>{formatPercent(percentual)} acerto</span> : null}
          {total != null ? (
            <span>
              {total} {total === 1 ? 'questão' : 'questões'}
            </span>
          ) : null}
          {concluidaEm ? <span>{formatConclusao(concluidaEm)}</span> : null}
          {current ? <span className="text-cyan-700">Esta semana</span> : null}
        </div>
      </div>
    </div>
  );
}
