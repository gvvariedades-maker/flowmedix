'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklySimuladoMission } from '@/lib/simulado/types';
import { generateWeeklySimulado } from '@/lib/simulado/client';
import { weeklySimuladoAlunoTitulo } from '@/lib/simulado/weeklyDisplayTitle';
import type { WeeklyMissionEntitlement } from '@/lib/freemium/weeklyMissionEntitlement';
import { weeklyMissionBlockMessage } from '@/lib/freemium/weeklyMissionEntitlement';

export type WeeklySimuladoMissionCardProps = {
  mission: WeeklySimuladoMission;
  onMissionUpdate?: (mission: WeeklySimuladoMission) => void;
  entitlement?: WeeklyMissionEntitlement;
};

function formatWeekDeadline(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'até domingo';
  return `até ${date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })}`;
}

function statusLabel(status: WeeklySimuladoMission['status']): string {
  switch (status) {
    case 'pendente':
      return 'Pendente';
    case 'em_andamento':
      return 'Em andamento';
    case 'concluido':
      return 'Concluído';
    default:
      return 'Indisponível';
  }
}

function statusBadgeClass(status: WeeklySimuladoMission['status']): string {
  switch (status) {
    case 'pendente':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100';
    case 'em_andamento':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-100';
    case 'concluido':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
    default:
      return 'border-white/10 bg-white/5 text-slate-300';
  }
}

export function WeeklySimuladoMissionCard({
  mission,
  onMissionUpdate,
  entitlement,
}: WeeklySimuladoMissionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressLabel =
    mission.total_questoes && mission.respondidas != null
      ? `${mission.respondidas}/${mission.total_questoes} questões`
      : mission.total_questoes
        ? `${mission.total_questoes} questões`
        : null;

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklySimulado();
      if (result.mission) {
        onMissionUpdate?.(result.mission);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o simulado.');
    } finally {
      setLoading(false);
    }
  }, [onMissionUpdate]);

  const ctaHref = mission.session_id ? `/simulados/${mission.session_id}` : null;
  const isReady = mission.status !== 'ausente' && mission.session_id != null;
  const isCompleted = mission.status === 'concluido';
  const tituloAluno = weeklySimuladoAlunoTitulo(mission.weekly_ordinal);
  const generateBlocked =
    entitlement != null && !entitlement.allowed && !isReady;
  const blockMessage =
    entitlement != null && !entitlement.allowed
      ? weeklyMissionBlockMessage(entitlement)
      : null;

  return (
    <section
      data-testid="weekly-simulado-mission-card"
      aria-labelledby="weekly-simulado-mission-title"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_20px_60px_-30px_rgba(0,242,255,0.45)] sm:p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
              <Sparkles size={12} aria-hidden />
              Missão da semana
            </span>
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                statusBadgeClass(mission.status),
              )}
            >
              {statusLabel(mission.status)}
            </span>
          </div>

          <h2
            id="weekly-simulado-mission-title"
            className="text-lg font-black leading-tight text-white sm:text-xl"
          >
            {isReady ? `${tituloAluno} está pronto!` : tituloAluno}
          </h2>

          <p className="text-sm text-slate-300">
            Avaliação personalizada com base no seu perfil e desempenho.{' '}
            {formatWeekDeadline(mission.week_ends_at)}.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {progressLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={14} className="text-cyan-300" aria-hidden />
                {progressLabel}
                {isCompleted && mission.percentual_acerto != null
                  ? ` · ${Math.round(mission.percentual_acerto)}% de acerto`
                  : null}
              </span>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          {isReady && ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300"
            >
              {isCompleted ? 'Ver resultado' : mission.status === 'em_andamento' ? 'Continuar' : 'Iniciar simulado'}
              <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={loading || generateBlocked}
              title={generateBlocked ? blockMessage ?? undefined : undefined}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  Gerando...
                </>
              ) : (
                <>
                  Gerar simulado
                  <ArrowRight size={16} aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeeklySimuladoMissionCard;
