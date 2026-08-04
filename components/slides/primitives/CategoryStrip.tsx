'use client';

import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface CategoryStripProps {
  label: string;
  tone?: BoardTone;
  className?: string;
}

/** Faixa de grupo (PNI faixa etária, COREN/COFEN, pilares) — chip sólido G2. */
export function CategoryStrip({ label, tone = 'accent', className }: CategoryStripProps) {
  const t = boardTone(tone);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm',
        t.badge,
        t.badgeText,
        className,
      )}
    >
      {label}
    </div>
  );
}
