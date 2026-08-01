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

/** Callout “Atenção” / status — footer ou banner de comando. */
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
        'flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-center',
        t.panel,
        className,
      )}
    >
      <p
        className={cn(
          'flex items-center justify-center gap-2 font-body text-xs font-semibold',
          t.text,
        )}
      >
        {Icon ? <Icon className={cn('h-3.5 w-3.5 shrink-0', t.columnLabel)} aria-hidden /> : null}
        {children}
      </p>
    </div>
  );
}
