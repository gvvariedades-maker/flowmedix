'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
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
      return 'border-[var(--color-border-default)] bg-[var(--color-brand-wash)] text-[var(--color-brand-text)]';
    case 'em_andamento':
      return 'border-[var(--color-warning)]/30 bg-[var(--color-warning-dim)] text-[var(--color-warning-text)]';
    case 'concluido':
      return 'border-[var(--color-success)]/35 bg-[var(--color-success-dim)] text-[var(--color-success-text)]';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-500';
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
      className={cn(
        'relative overflow-hidden rounded-r-2xl border px-4 py-4 [border-left-width:4px] sm:px-5',
        vitrineBrand.tintBorder,
        vitrineBrand.borderL,
        vitrineBrand.tintBg,
      )}
    >
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
                vitrineBrand.tintBorder,
                vitrineBrand.tintBg,
                vitrineBrand.text,
              )}
            >
              <Sparkles size={12} aria-hidden />
              Missão da semana
            </span>
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
                statusBadgeClass(mission.status),
              )}
            >
              {statusLabel(mission.status)}
            </span>
          </div>

          <h2
            id="weekly-simulado-mission-title"
            className="text-lg font-bold leading-tight text-slate-900 sm:text-xl"
          >
            {isReady ? `${tituloAluno} está pronto!` : tituloAluno}
          </h2>

          <p className="text-sm text-slate-600">
            Avaliação personalizada com base no seu perfil e desempenho.{' '}
            {formatWeekDeadline(mission.week_ends_at)}.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {progressLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={14} className={vitrineBrand.icon} aria-hidden />
                {progressLabel}
                {isCompleted && mission.percentual_acerto != null
                  ? ` · ${Math.round(mission.percentual_acerto)}% de acerto`
                  : null}
              </span>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          {isReady && ctaHref ? (
            <Link href={ctaHref} className={cn(vitrineBrand.buttonPrimarySolid, 'shrink-0')}>
              {isCompleted
                ? 'Ver resultado'
                : mission.status === 'em_andamento'
                  ? 'Continuar'
                  : 'Iniciar simulado'}
              <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={loading || generateBlocked}
              title={generateBlocked ? (blockMessage ?? undefined) : undefined}
              className={cn(vitrineBrand.buttonPrimarySolid, 'shrink-0')}
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
