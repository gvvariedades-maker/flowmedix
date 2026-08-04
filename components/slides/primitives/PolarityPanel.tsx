'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface PolarityPanelProps {
  tone?: BoardTone;
  className?: string;
  children: ReactNode;
  /**
   * Herói da tela (barra G2): escala + glow.
   * Use no gabarito EXCETO / coluna certa / âncora — um por slide.
   */
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
        'relative overflow-hidden rounded-2xl border-2 p-3.5 shadow-md transition-transform md:p-4',
        t.panel,
        emphasized && t.heroRing,
        className,
      )}
    >
      <span
        className={cn('pointer-events-none absolute inset-y-0 left-0 w-1.5', t.accent)}
        aria-hidden
      />
      <div className="relative pl-1.5">{children}</div>
    </div>
  );
}
