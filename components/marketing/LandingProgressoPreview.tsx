'use client';

import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { LANDING_DEMO_PROGRESSO_ITEMS } from '@/lib/marketing/landingDemoPreview';
import { LandingDemoJourneyChip } from '@/components/marketing/LandingDemoJourneyChip';
import { cn } from '@/lib/utils';

const DONE_COUNT = LANDING_DEMO_PROGRESSO_ITEMS.filter((item) => item.done).length;
const TOTAL_COUNT = LANDING_DEMO_PROGRESSO_ITEMS.length;

/** Preview estático do progresso — diagnóstico + NeuroSlides ligados à questão demo. */
export function LandingProgressoPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none flex select-none flex-col bg-[#f8fafc]', className)}
      aria-hidden
    >
      <LandingDemoJourneyChip />
      <div className="flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-[#9A3412]" size={16} aria-hidden />
          <p className="text-xs font-black text-slate-900">Seu progresso</p>
        </div>
        <span className="rounded-full bg-[#F26522]/15 px-2 py-0.5 text-[9px] font-bold text-[#9A3412]">
          {DONE_COUNT}/{TOTAL_COUNT} feito
        </span>
      </div>
      <ul className="space-y-2">
        {LANDING_DEMO_PROGRESSO_ITEMS.map((item) => (
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
              <Circle className="mt-0.5 shrink-0 text-slate-400" size={14} aria-hidden />
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
        <div
          className="h-full rounded-full bg-[#22c55e] transition-all"
          style={{ width: `${(DONE_COUNT / TOTAL_COUNT) * 100}%` }}
        />
      </div>
      </div>
    </div>
  );
}
