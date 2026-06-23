import { CalendarClock, Sparkles } from 'lucide-react';
import { NeonBadge } from '@/components/ui/neon-badge';
import { getIsoWeekInfo } from '@/lib/simulado/sessionKind';
import { weeklySimuladoAlunoTitulo } from '@/lib/simulado/weeklyDisplayTitle';

function formatWeekDeadline(isoDate: Date): string {
  return `Próxima missão na ${isoDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })}`;
}

type WeeklyMissionConclusaoHeaderProps = {
  weeklyOrdinal?: number | null;
};

export function WeeklyMissionConclusaoHeader({
  weeklyOrdinal,
}: WeeklyMissionConclusaoHeaderProps) {
  const weekInfo = getIsoWeekInfo();
  const tituloAluno = weeklySimuladoAlunoTitulo(weeklyOrdinal);

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
        </NeonBadge>
      </div>

      <h2
        id="weekly-mission-conclusao-title"
        className="text-lg font-bold text-slate-900"
      >
        {tituloAluno} concluído
      </h2>

      <p className="inline-flex items-center gap-2 text-sm text-slate-600">
        <CalendarClock className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden />
        {formatWeekDeadline(weekInfo.weekEndsAt)}
      </p>
    </section>
  );
}
