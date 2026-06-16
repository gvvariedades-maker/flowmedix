'use client';

import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TODAY_ITEMS = [
  { label: 'Revisar: Cálculo de medicamentos', done: true },
  { label: 'Nova questão: Oxigenoterapia', done: false },
  { label: 'Simulado parcial — 10 questões', done: false },
] as const;

/** Preview estático do plano diário editorial. */
export function LandingPlanoDiarioPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none select-none bg-[#f8fafc] p-4', className)}
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-[#3d6b0f]" size={16} aria-hidden />
          <p className="text-xs font-black text-slate-900">Plano de hoje</p>
        </div>
        <span className="rounded-full bg-[#8fe020]/15 px-2 py-0.5 text-[9px] font-bold text-[#3d6b0f]">
          1/3 feito
        </span>
      </div>
      <ul className="space-y-2">
        {TODAY_ITEMS.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex items-start gap-2 rounded-xl border px-3 py-2.5',
              item.done ? 'border-emerald-200 bg-emerald-50/80' : 'border-slate-200 bg-white',
            )}
          >
            {item.done ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={14} aria-hidden />
            ) : (
              <Clock className="mt-0.5 shrink-0 text-slate-400" size={14} aria-hidden />
            )}
            <span
              className={cn(
                'text-[11px] font-semibold leading-snug',
                item.done ? 'text-emerald-900 line-through decoration-emerald-600/40' : 'text-slate-800',
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 rounded-full bg-[#22c55e]" />
      </div>
    </div>
  );
}
