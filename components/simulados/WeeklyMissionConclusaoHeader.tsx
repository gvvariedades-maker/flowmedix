import { CalendarClock, Sparkles, Target } from 'lucide-react';
import { NeonBadge } from '@/components/ui/neon-badge';
import { getIsoWeekInfo } from '@/lib/simulado/sessionKind';
import { WEEKLY_POOL_BUCKET_SHARES } from '@/lib/simulado/weeklySimuladoCore';

const BUCKET_LABELS: Record<keyof typeof WEEKLY_POOL_BUCKET_SHARES, string> = {
  weakness: 'fraquezas',
  affinity: 'afinidade',
  not_attempted: 'não tentados',
  review: 'revisão',
};

function formatWeekDeadline(isoDate: Date): string {
  return `Próxima missão na ${isoDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })}`;
}

function formatBucketComposition(filtros: Record<string, unknown>): string | null {
  const shares = filtros.bucket_shares as Record<string, number> | undefined;
  if (!shares || typeof shares !== 'object') {
    return Object.entries(WEEKLY_POOL_BUCKET_SHARES)
      .map(([key, pct]) => `${BUCKET_LABELS[key as keyof typeof WEEKLY_POOL_BUCKET_SHARES]} ${Math.round(pct * 100)}%`)
      .join(' · ');
  }

  const parts = Object.entries(WEEKLY_POOL_BUCKET_SHARES)
    .map(([key, defaultPct]) => {
      const pct = typeof shares[key] === 'number' ? shares[key]! : defaultPct;
      return `${BUCKET_LABELS[key as keyof typeof WEEKLY_POOL_BUCKET_SHARES]} ${Math.round(pct * 100)}%`;
    })
    .join(' · ');

  return parts || null;
}

type WeeklyMissionConclusaoHeaderProps = {
  filtros: Record<string, unknown>;
  isoWeek: number | null;
};

export function WeeklyMissionConclusaoHeader({
  filtros,
  isoWeek,
}: WeeklyMissionConclusaoHeaderProps) {
  const foco =
    typeof filtros.foco_principal === 'string' ? filtros.foco_principal.trim() : null;
  const weekInfo = getIsoWeekInfo();
  const composicao = formatBucketComposition(filtros);

  return (
    <section
      aria-labelledby="weekly-mission-conclusao-title"
      className="card-elevated-lg space-y-3 border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.04] to-white p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <NeonBadge
          variant="brand"
          className="inline-flex items-center gap-1.5 border-cyan-400/30 bg-cyan-400/10 text-[11px] uppercase tracking-wide text-cyan-700"
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          Missão da semana
          {isoWeek != null ? ` · Semana ${isoWeek}` : null}
        </NeonBadge>
      </div>

      <h2
        id="weekly-mission-conclusao-title"
        className="text-lg font-bold text-slate-900"
      >
        Avaliação semanal concluída
      </h2>

      {foco ? (
        <p className="inline-flex items-center gap-2 text-sm text-slate-700">
          <Target className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden />
          Foco principal: <span className="font-semibold">{foco}</span>
        </p>
      ) : null}

      <p className="inline-flex items-center gap-2 text-sm text-slate-600">
        <CalendarClock className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden />
        {formatWeekDeadline(weekInfo.weekEndsAt)}
      </p>

      {composicao ? (
        <p className="text-xs text-slate-500">
          Composição do pool: {composicao}
        </p>
      ) : null}
    </section>
  );
}
