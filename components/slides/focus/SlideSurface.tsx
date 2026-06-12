'use client';

import type { ReactNode } from 'react';
import type { FocusAccent } from '@/lib/slides/focusAccent';
import { cn } from '@/lib/utils';

export type SlideSurfaceSemantic = 'neutral' | 'danger';

export interface SlideSurfaceProps {
  accent: FocusAccent;
  semantic?: SlideSurfaceSemantic;
  children: ReactNode;
  className?: string;
}

/**
 * Superfície compartilhada Opção A — fundo slate neutro + glow sutil do acento (ou semântica).
 */
export function SlideSurface({
  accent,
  semantic = 'neutral',
  children,
  className,
}: SlideSurfaceProps) {
  const glowColor =
    semantic === 'danger' ? 'rgba(248, 113, 113, 0.12)' : accent.glow;

  return (
    <div
      className={cn(
        'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto',
        className,
      )}
      style={{ backgroundColor: 'var(--color-surface-0)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 55% at 50% 0%, ${glowColor} 0%, transparent 68%)`,
        }}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
