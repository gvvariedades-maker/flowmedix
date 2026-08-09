'use client';

import type { ReactNode } from 'react';
import { CheckCircle2, Flame, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

type FloatingCardProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  tone?: 'success' | 'warning' | 'brand';
};

function FloatingCard({ icon, title, subtitle, className, tone = 'brand' }: FloatingCardProps) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-white shadow-emerald-100/50'
      : tone === 'warning'
        ? 'border-amber-200 bg-white shadow-amber-100/50'
        : 'border-slate-200 bg-white shadow-slate-200/60';

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm',
        toneClass,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12px] font-bold leading-snug text-slate-900">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Cards flutuantes entre os devices — estilo Estudei. */
export function LandingHeroFloatingCards({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none hidden lg:block', className)} aria-hidden>
      {/* Entre laptop e tablet — canto superior */}
      <FloatingCard
        tone="warning"
        className="absolute right-[14%] top-[6%] z-40 w-[200px]"
        icon={<Flame size={18} className="text-amber-500" aria-hidden />}
        title="Streak de 5 dias"
        subtitle="Continue assim!"
      />
      {/* Gap esquerdo — abaixo do tablet */}
      <FloatingCard
        tone="success"
        className="absolute bottom-[38%] left-[0%] z-40 w-[195px]"
        icon={<CheckCircle2 size={18} className="text-emerald-500" aria-hidden />}
        title="Acertou 8/10 hoje"
        subtitle="Curativos e Manejo de Feridas"
      />
      {/* Entre tablet e phone */}
      <FloatingCard
        className="absolute bottom-[14%] left-[28%] z-40 w-[175px]"
        icon={<Layers size={18} className="text-[#9A3412]" aria-hidden />}
        title="4 NeuroSlides"
        subtitle="por questão"
      />
    </div>
  );
}
