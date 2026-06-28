'use client';

import { ArrowRight, CalendarClock, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Preview estático do hub Missão da Semana (marketing). */
export function LandingMissaoSemanalPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none select-none space-y-3 bg-[#0f172a] p-4',
        className,
      )}
      aria-hidden
    >
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_20px_60px_-30px_rgba(0,242,255,0.45)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <div className="relative space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-200">
              <Sparkles size={10} aria-hidden />
              Missão da semana
            </span>
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-100">
              Pendente
            </span>
          </div>
          <p className="text-sm font-black leading-tight text-white">
            2º simulado semanal está pronto!
          </p>
          <p className="text-[10px] leading-relaxed text-slate-300">
            Avaliação personalizada com base no seu perfil e desempenho. até domingo, 28 de jun.
          </p>
          <p className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <CalendarClock size={12} className="text-cyan-300" aria-hidden />
            0/10 questões
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-950">
            Iniciar simulado
            <ArrowRight size={12} aria-hidden />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden />
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                Streak
              </p>
              <p className="text-xs font-black text-white">1 semana</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                Ciclo
              </p>
              <p className="text-[10px] font-semibold leading-snug text-slate-200">
                Próxima: segunda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">
          Histórico
        </p>
        <div className="mt-2 flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white">1º simulado semanal</p>
            <p className="text-[9px] text-slate-400">50% acerto · 10 questões</p>
          </div>
          <span className="ml-auto text-[9px] font-semibold text-cyan-300">Ver resumo →</span>
        </div>
      </div>
    </div>
  );
}
