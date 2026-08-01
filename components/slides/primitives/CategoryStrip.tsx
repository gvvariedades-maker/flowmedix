'use client';

import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface CategoryStripProps {
  label: string;
  tone?: BoardTone;
  className?: string;
}

/** Faixa de grupo (PNI faixa etária, COREN/COFEN, pilares). */
export function CategoryStrip({ label, tone = 'accent', className }: CategoryStripProps) {
  const t = boardTone(tone);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider',
        t.badge,
        t.badgeText,
        t.border,
        className,
      )}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', t.accent)} aria-hidden />
      {label}
    </div>
  );
}
