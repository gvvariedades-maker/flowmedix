'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface PolarityPanelProps {
  tone?: BoardTone;
  className?: string;
  children: ReactNode;
  /** Ring extra (ex.: exception highlighted). */
  emphasized?: boolean;
}

/** Painel com polaridade canônica (keep / exception / command / …). */
export function PolarityPanel({
  tone = 'neutral',
  className,
  children,
  emphasized = false,
}: PolarityPanelProps) {
  const t = boardTone(tone);
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-3 shadow-sm md:rounded-2xl md:p-3.5',
        t.panel,
        emphasized && tone === 'exception' && 'ring-1 ring-rose-200',
        emphasized && tone === 'barrier' && 'ring-1 ring-rose-200',
        className,
      )}
    >
      {children}
    </div>
  );
}
