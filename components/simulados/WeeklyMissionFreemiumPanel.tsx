'use client';

import Link from 'next/link';
import { CalendarClock, Lock, Sparkles } from 'lucide-react';
import type { WeeklyMissionEntitlement } from '@/lib/freemium/weeklyMissionEntitlement';
import { weeklyMissionBlockMessage } from '@/lib/freemium/weeklyMissionEntitlement';
import { cn } from '@/lib/utils';

type WeeklyMissionFreemiumPanelProps = {
  entitlement: Extract<WeeklyMissionEntitlement, { allowed: false }>;
  className?: string;
};

function formatUnlockDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  });
}

export function WeeklyMissionFreemiumPanel({
  entitlement,
  className,
}: WeeklyMissionFreemiumPanelProps) {
  const message = weeklyMissionBlockMessage(entitlement);
  const isUpgrade = entitlement.reason === 'upgrade_required';
  const isWaiting = entitlement.reason === 'waiting_period';
  const isDiagnostico = entitlement.reason === 'diagnostico_pending';

  return (
    <section
      data-testid="weekly-mission-freemium-panel"
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 sm:p-6',
        isUpgrade
          ? 'border-[#F26522]/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'border-slate-200 bg-slate-50',
        className,
      )}
    >
      {isUpgrade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#F26522]/10 blur-3xl"
        />
      ) : null}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                isUpgrade
                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              {isUpgrade ? <Sparkles size={12} aria-hidden /> : <Lock size={12} aria-hidden />}
              Missão da semana
            </span>
            {isWaiting && entitlement.unlockAt ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                <CalendarClock size={12} aria-hidden />
                Em breve
              </span>
            ) : null}
          </div>

          <h2
            className={cn(
              'text-lg font-black leading-tight sm:text-xl',
              isUpgrade ? 'text-white' : 'text-slate-900',
            )}
          >
            {isUpgrade
              ? 'Continue sua evolução toda semana'
              : isDiagnostico
                ? 'Primeiro passo: simulado diagnóstico'
                : 'Sua 2ª missão personalizada está chegando'}
          </h2>

          <p className={cn('text-sm', isUpgrade ? 'text-slate-300' : 'text-slate-600')}>
            {message}
            {isWaiting && entitlement.unlockAt
              ? ` Libera ${formatUnlockDate(entitlement.unlockAt)}.`
              : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isDiagnostico ? (
            <Link
              href="/estudar"
              className="btn-editorial-primary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-sm font-black uppercase tracking-wide"
            >
              Fazer diagnóstico
            </Link>
          ) : isUpgrade ? (
            <Link
              href="/assinatura"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#FF8A3D] via-[#F26522] to-[#D45212] px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(212,82,18,0.35)] transition hover:brightness-95"
            >
              Assinar Pro
            </Link>
          ) : (
            <Link
              href="/estudar"
              className="btn-editorial-outline inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-sm font-semibold"
            >
              Continuar estudando
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
