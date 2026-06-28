'use client';

import { CheckCircle2 } from 'lucide-react';
import {
  LANDING_DEMO_CORRECT_OPTION,
  LANDING_DEMO_GABARITO_FEEDBACK,
  LANDING_DEMO_INSTRUCTION_SNIPPET,
  LANDING_DEMO_SUBTOPICO,
} from '@/lib/marketing/landingDemoPreview';
import { LandingDemoJourneyChip } from '@/components/marketing/LandingDemoJourneyChip';
import { cn } from '@/lib/utils';

/** Preview estático do feedback pós-gabarito — mesma questão demo da landing. */
export function LandingGabaritoPreview({ className }: { className?: string }) {
  const correctId = LANDING_DEMO_CORRECT_OPTION?.id ?? 'C';
  const correctText = LANDING_DEMO_CORRECT_OPTION?.text ?? '560 mg.';

  return (
    <div
      className={cn('pointer-events-none flex select-none flex-col bg-[#f8fafc]', className)}
      aria-hidden
    >
      <LandingDemoJourneyChip />
      <div className="flex-1 p-4">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-emerald-600" size={22} aria-hidden />
          <p className="text-sm font-black text-emerald-800">Você acertou!</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {LANDING_DEMO_GABARITO_FEEDBACK}
        </p>
        <p className="mt-2 line-clamp-2 text-[10px] italic text-slate-500">
          &ldquo;{LANDING_DEMO_INSTRUCTION_SNIPPET}…&rdquo;
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800">
            Alternativa {correctId} — {correctText}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {LANDING_DEMO_SUBTOPICO}
          </span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Próximo passo</p>
        <p className="mt-1 text-xs font-semibold text-slate-800">Estudo reverso — 4 NeuroSlides</p>
      </div>
      </div>
    </div>
  );
}
