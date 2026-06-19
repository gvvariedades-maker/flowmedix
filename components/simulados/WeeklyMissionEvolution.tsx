import { TrendingDown, TrendingUp } from 'lucide-react';
import type { WeeklyEixoDelta, WeeklyMissionEvolution } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

type WeeklyMissionEvolutionProps = {
  evolution: WeeklyMissionEvolution;
};

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta} p.p.`;
}

export function WeeklyMissionEvolutionPanel({ evolution }: WeeklyMissionEvolutionProps) {
  if (!evolution.has_previous) {
    return (
      <section
        aria-labelledby="weekly-evolution-title"
        className="card-elevated-lg space-y-2 p-6"
      >
        <h2
          id="weekly-evolution-title"
          className="text-sm font-semibold uppercase tracking-wider text-slate-500"
        >
          Evolução semanal
        </h2>
        <p className="text-sm text-slate-600">{evolution.mensagem_vazia}</p>
      </section>
    );
  }

  const deltaGlobal = evolution.delta_global;
  const deltaPositive = deltaGlobal !== null && deltaGlobal >= 0;

  return (
    <section
      aria-labelledby="weekly-evolution-title"
      className="card-elevated-lg space-y-4 p-6"
    >
      <h2
        id="weekly-evolution-title"
        className="text-sm font-semibold uppercase tracking-wider text-slate-500"
      >
        Evolução semanal
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-sm text-slate-600">
          Semana {evolution.iso_week_anterior} → Semana {evolution.iso_week_atual}
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-sm text-slate-500">
            {evolution.percentual_anterior}%
          </span>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <span className="text-lg font-bold text-slate-900">
            {evolution.percentual_atual}%
          </span>
          {deltaGlobal !== null ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm font-semibold',
                deltaPositive ? 'text-emerald-600' : 'text-rose-500',
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="h-4 w-4" aria-hidden />
              ) : (
                <TrendingDown className="h-4 w-4" aria-hidden />
              )}
              {formatDelta(deltaGlobal)}
            </span>
          ) : null}
        </div>
      </div>

      {evolution.eixos_destaque.length > 0 ? (
        <ul className="space-y-2">
          {evolution.eixos_destaque.map((item) => (
            <li
              key={item.eixo}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-800">{item.eixo}</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 tabular-nums font-semibold',
                  item.direction === 'up' ? 'text-emerald-600' : 'text-rose-500',
                )}
              >
                {item.direction === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                )}
                {item.percentual_anterior}% → {item.percentual_atual}% (
                {formatDelta(item.delta_pontos)})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          Desempenho estável em relação à semana anterior.
        </p>
      )}
    </section>
  );
}
