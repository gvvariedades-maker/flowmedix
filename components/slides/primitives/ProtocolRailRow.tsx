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
        'flex min-h-[44px] items-start gap-3 rounded-2xl border-2 p-3 shadow-sm',
        t.panel,
        active && 'ring-2 ring-offset-1 ring-sky-300/60',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-black',
          t.badge,
          t.badgeText,
        )}
        aria-hidden
      >
        {badge}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm font-bold leading-snug text-slate-900">{title}</p>
        {detail ? (
          <div className="mt-1 font-body text-xs leading-relaxed text-slate-600">{detail}</div>
        ) : null}
      </div>
    </div>
  );
}
