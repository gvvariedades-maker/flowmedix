'use client';

import { Link2 } from 'lucide-react';
import { LANDING_DEMO_JOURNEY_LABEL } from '@/lib/marketing/landingDemoPreview';
import { cn } from '@/lib/utils';

/** Faixa que amarra os 4 previews à mesma questão demo. */
export function LandingDemoJourneyChip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 border-b border-slate-200/80 bg-slate-50 px-3 py-1.5',
        className,
      )}
      aria-hidden
    >
      <Link2 className="shrink-0 text-[#3d6b0f]" size={12} />
      <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-600">
        Mesma jornada · {LANDING_DEMO_JOURNEY_LABEL}
      </p>
    </div>
  );
}
