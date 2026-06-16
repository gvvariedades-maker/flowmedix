'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Preview estático do feedback pós-gabarito no player editorial. */
export function LandingGabaritoPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none select-none bg-[#f8fafc] p-4', className)}
      aria-hidden
    >
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-emerald-600" size={22} aria-hidden />
          <p className="text-sm font-black text-emerald-800">Resposta correta — alternativa C</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Você aplicou a regra de três com o volume total da solução (60 mL), não só a ampola.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800">
            Conceito ok
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            Cálculo de dose
          </span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Próximo passo</p>
        <p className="mt-1 text-xs font-semibold text-slate-800">Estudo reverso — 4 NeuroSlides</p>
      </div>
    </div>
  );
}
