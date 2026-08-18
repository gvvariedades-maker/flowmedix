'use client';

import { Flame, Sparkles, Target, Trophy } from 'lucide-react';
import type { SimuladoConclusaoIncentivos } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

type ConclusaoIncentivosBannerProps = {
  incentivos: SimuladoConclusaoIncentivos | null | undefined;
};

function badgeLabel(badge: SimuladoConclusaoIncentivos['streak']['badge']): string {
  if (badge === 'streak_semanas') return 'Streak semanal';
  if (badge === 'meta_semanal') return 'Meta semanal';
  if (badge === 'streak_dias') return 'Streak diário';
  return 'Destaque';
}

export function ConclusaoIncentivosBanner({ incentivos }: ConclusaoIncentivosBannerProps) {
  if (!incentivos) return null;

  const { streak, mensagens_destaque, eixos_evolucao, dominios } = incentivos;
  const hasStreak = streak.badge !== null && streak.mensagem;
  const hasHighlights =
    mensagens_destaque.length > 0 || eixos_evolucao.length > 0 || dominios.length > 0;

  if (!hasStreak && !hasHighlights) return null;

  const renderBadgeIcon = () => {
    if (streak.badge === 'streak_semanas') return <Trophy className="h-5 w-5" aria-hidden />;
    if (streak.badge === 'meta_semanal') return <Target className="h-5 w-5" aria-hidden />;
    if (streak.badge === 'streak_dias') return <Flame className="h-5 w-5" aria-hidden />;
    return <Sparkles className="h-5 w-5" aria-hidden />;
  };

  return (
    <section
      aria-labelledby="simulado-incentivos-titulo"
      className="card-elevated-lg space-y-4 overflow-hidden p-6"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-[#9A3412]" aria-hidden />
        <h2
          id="simulado-incentivos-titulo"
          className="text-sm font-semibold uppercase tracking-wider text-slate-500"
        >
          Seu progresso
        </h2>
      </div>

      {hasStreak ? (
        <div
          className={cn(
            'flex items-start gap-3 rounded-2xl border px-4 py-3',
            streak.badge === 'streak_semanas'
              ? 'border-amber-300/60 bg-amber-50'
              : streak.badge === 'meta_semanal'
                ? 'border-emerald-300/60 bg-emerald-50'
                : 'border-orange-300/60 bg-orange-50',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              streak.badge === 'streak_semanas'
                ? 'bg-amber-100 text-amber-700'
                : streak.badge === 'meta_semanal'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-orange-100 text-orange-700',
            )}
            aria-hidden
          >
            {renderBadgeIcon()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {badgeLabel(streak.badge)}
            </p>
            <p className="text-sm font-medium text-slate-800">{streak.mensagem}</p>
            {streak.semanas_consecutivas_simulado > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {streak.semanas_consecutivas_simulado}{' '}
                {streak.semanas_consecutivas_simulado === 1 ? 'semana' : 'semanas'} com simulado
                concluído
                {streak.streak_atual_dias > 0
                  ? ` · ${streak.streak_atual_dias} ${
                      streak.streak_atual_dias === 1 ? 'dia' : 'dias'
                    } ativo`
                  : ''}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {mensagens_destaque.length > 0 ? (
        <ul className="space-y-2">
          {mensagens_destaque
            .filter((msg) => msg !== streak.mensagem)
            .slice(0, 3)
            .map((mensagem) => (
              <li
                key={mensagem}
                className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-sm text-slate-800"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>{mensagem}</span>
              </li>
            ))}
        </ul>
      ) : null}
    </section>
  );
}
