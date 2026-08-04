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
  /**
   * `rail` = chip em coluna sólida (Falar × Barreira G2).
   * `default` = chip no topo do card.
   */
  layout?: 'default' | 'rail';
}

/**
 * Chip/rótulo + corpo — calendário idade×vacina, legis Art.×texto, SoftLens rows.
 * Barra G2: painel com massa; layout rail para contraste imediato.
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
  layout = 'default',
}: LabelBodyRowProps) {
  const t = boardTone(tone);

  if (layout === 'rail') {
    return (
      <div
        className={cn(
          'grid min-h-[4.5rem] grid-cols-[6.5rem_1fr] overflow-hidden rounded-2xl border-2 shadow-md',
          t.border,
          className,
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center px-2 text-center font-mono text-[11px] font-bold uppercase tracking-wide',
            t.badge,
            t.badgeText,
          )}
        >
          {chip}
        </div>
        <div
          className={cn(
            'flex flex-col justify-center bg-gradient-to-r from-white/90 to-white px-3 py-3',
            tone === 'barrier' || tone === 'exception' ? 'from-rose-50/80' : null,
            tone === 'ok' || tone === 'keep' ? 'from-emerald-50/80' : null,
          )}
        >
          <div
            className={cn(
              'font-body text-sm leading-snug',
              bodyStrong ? 'font-bold' : 'font-semibold',
              t.text,
            )}
          >
            {body}
          </div>
          {hint ? (
            <div className="mt-1.5 font-body text-xs text-slate-600">{hint}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border-2 p-3.5 shadow-md', t.panel, className)}>
      <span
        className={cn('pointer-events-none absolute inset-y-0 left-0 w-1.5', t.accent)}
        aria-hidden
      />
      <div className="relative pl-1.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          {Icon ? (
            <Icon
              className={cn('h-4 w-4 shrink-0', iconClassName ?? t.columnLabel)}
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              'inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
              t.badge,
              t.badgeText,
            )}
          >
            {chip}
          </span>
        </div>
        <div
          className={cn(
            'font-body text-sm leading-snug',
            bodyStrong ? 'font-bold' : 'font-semibold',
            t.text,
          )}
        >
          {body}
        </div>
        {hint ? (
          <div className="mt-2 rounded-lg bg-white/70 px-2 py-1.5 font-body text-xs text-slate-600">
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  );
}
