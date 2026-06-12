'use client';

import type { ReactNode } from 'react';
import type { EditorialAccent } from '@/lib/slides/editorialAccent';
import { cn } from '@/lib/utils';

export type EditorialSlideSurfaceSemantic = 'neutral' | 'danger';

export interface EditorialSlideSurfaceProps {
  accent: EditorialAccent;
  semantic?: EditorialSlideSurfaceSemantic;
  children: ReactNode;
  className?: string;
}

/**
 * Superfície compartilhada Opção B — fundo editorial claro + glow mínimo do acento.
 */
export function EditorialSlideSurface({
  accent,
  semantic = 'neutral',
  children,
  className,
}: EditorialSlideSurfaceProps) {
  const glowColor =
    semantic === 'danger' ? 'rgba(220, 38, 38, 0.05)' : accent.glow;

  return (
    <div
      className={cn(
        'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-slate-50',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 90% 50% at 50% 0%, ${glowColor} 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
