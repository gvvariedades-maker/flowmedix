'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface LabelBodyRowProps {
  chip: string;
  body: ReactNode;
  tone?: BoardTone;
  icon?: LucideIcon;
  iconClassName?: string;
  hint?: ReactNode;
  className?: string;
  /** Body em bold rose (barreira). */
  bodyStrong?: boolean;
}

/**
 * Chip/rótulo + corpo — calendário idade×vacina, legis Art.×texto, SoftLens rows.
 */
export function LabelBodyRow({
  chip,
  body,
  tone = 'neutral',
  icon: Icon,
  iconClassName,
  hint,
  className,
  bodyStrong = false,
}: LabelBodyRowProps) {
  const t = boardTone(tone);
  return (
    <div className={cn('rounded-xl border-2 p-3', t.panel, className)}>
      <div className="mb-1 flex items-center gap-1.5">
        {Icon ? (
          <Icon
            className={cn('h-4 w-4 shrink-0', iconClassName ?? t.columnLabel)}
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            'font-mono text-[9px] font-bold uppercase tracking-wider',
            tone === 'barrier' || tone === 'exception' ? t.columnLabel : 'text-slate-600',
          )}
        >
          {chip}
        </span>
      </div>
      <div
        className={cn(
          'font-body text-sm leading-snug',
          bodyStrong ? 'font-bold' : 'font-semibold',
          tone === 'barrier' || tone === 'exception' ? t.text : 'text-slate-900',
        )}
      >
        {body}
      </div>
      {hint ? (
        <div className="mt-2 rounded-lg bg-white/60 px-2 py-1.5 font-body text-xs text-slate-600">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
