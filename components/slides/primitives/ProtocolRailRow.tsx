'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface ProtocolRailRowProps {
  /** Letra / número em círculo (vem do JSON). */
  badge: string;
  title: string;
  detail?: ReactNode;
  tone?: BoardTone;
  /** Destaque quando a linha está ativa no trilho. */
  active?: boolean;
  className?: string;
}

/**
 * Linha de protocolo — XABCDE, I–V, ADME.
 * Badge nunca hardcoda gabarito: o caller passa o valor do JSON.
 */
export function ProtocolRailRow({
  badge,
  title,
  detail,
  tone = 'command',
  active = false,
  className,
}: ProtocolRailRowProps) {
  const t = boardTone(tone);
  return (
    <div
      className={cn(
        'relative flex min-h-[44px] items-start gap-3 overflow-hidden rounded-2xl border-2 p-3.5 shadow-md',
        t.panel,
        active && t.heroRing,
        className,
      )}
    >
      <span
        className={cn('pointer-events-none absolute inset-y-0 left-0 w-1.5', t.accent)}
        aria-hidden
      />
      <span
        className={cn(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-black shadow-sm',
          t.badge,
          t.badgeText,
        )}
        aria-hidden
      >
        {badge}
      </span>
      <div className="relative min-w-0 flex-1">
        <p className={cn('font-body text-sm font-bold leading-snug', t.text)}>{title}</p>
        {detail ? (
          <div className="mt-1 font-body text-xs font-medium leading-relaxed text-slate-700">
            {detail}
          </div>
        ) : null}
      </div>
    </div>
  );
}
