'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface AlertCalloutProps {
  tone?: Extract<BoardTone, 'info' | 'warn' | 'transfer' | 'command'>;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  role?: 'status' | 'note' | 'alert';
}

/** Callout “Atenção” / status — banner com massa (barra G2). */
export function AlertCallout({
  tone = 'warn',
  icon: Icon,
  children,
  className,
  role = 'status',
}: AlertCalloutProps) {
  const t = boardTone(tone);
  return (
    <div
      role={role}
      className={cn(
        'relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 px-3 py-2.5 text-center shadow-md',
        t.panel,
        className,
      )}
    >
      <span
        className={cn('pointer-events-none absolute inset-y-0 left-0 w-1.5', t.accent)}
        aria-hidden
      />
      <p
        className={cn(
          'relative flex items-center justify-center gap-2 font-body text-xs font-bold md:text-sm',
          t.text,
        )}
      >
        {Icon ? <Icon className={cn('h-4 w-4 shrink-0', t.columnLabel)} aria-hidden /> : null}
        {children}
      </p>
    </div>
  );
}
