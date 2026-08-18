'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

type RowIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export interface LabelBodyRowProps {
  chip: string;
  body: ReactNode;
  tone?: BoardTone;
  icon?: RowIcon;
  iconClassName?: string;
  hint?: ReactNode;
  className?: string;
  /** Body em bold rose (barreira). */
  bodyStrong?: boolean;
  /**
   * `rail` = chip em coluna sólida (Falar × Barreira G2 / timeline label×corpo).
   * `default` = chip no topo do card.
   */
  layout?: 'default' | 'rail';
  /** Destaque herói (ring) — pegadinha / prioridade. */
  emphasized?: boolean;
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
  emphasized = false,
}: LabelBodyRowProps) {
  const t = boardTone(tone);

  if (layout === 'rail') {
    return (
      <div
        className={cn(
          'grid min-h-[4.5rem] grid-cols-[5.75rem_1fr] overflow-hidden rounded-2xl border-2 shadow-md sm:grid-cols-[6.75rem_1fr]',
          t.border,
          emphasized && t.heroRing,
          className,
        )}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-1.5 py-2.5 text-center',
            t.badge,
            t.badgeText,
          )}
        >
          {Icon ? (
            <Icon
              className={cn('h-5 w-5 shrink-0 opacity-95', iconClassName)}
              aria-hidden
            />
          ) : null}
          <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-[11px]">
            {chip}
          </span>
        </div>
        <div
          className={cn(
            'flex flex-col justify-center bg-gradient-to-r from-white/95 to-white px-3 py-3',
            tone === 'barrier' || tone === 'exception' ? 'from-rose-50/90' : null,
            tone === 'ok' || tone === 'keep' ? 'from-emerald-50/85' : null,
            tone === 'command' ? 'from-sky-50/85' : null,
            tone === 'rights' ? 'from-indigo-50/85' : null,
            tone === 'teal' ? 'from-teal-50/85' : null,
            tone === 'warn' || tone === 'transfer' ? 'from-amber-50/85' : null,
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
            <div className="mt-1.5 font-body text-xs leading-relaxed text-slate-600">{hint}</div>
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
