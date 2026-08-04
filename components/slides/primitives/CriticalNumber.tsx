'use client';

import { cn } from '@/lib/utils';
import { boardTone, type BoardTone } from './boardTokens';

export interface CriticalNumberProps {
  value: string | number;
  unit?: string;
  /** Rotulo curto acima (ex.: “intervalo”, “dose”). */
  label?: string;
  emphasis?: 'default' | 'alert' | 'ok';
  className?: string;
}

const EMPHASIS_TONE: Record<NonNullable<CriticalNumberProps['emphasis']>, BoardTone> = {
  default: 'command',
  alert: 'transfer',
  ok: 'ok',
};

/** Número crítico de prova — doses, prazos, jatos (âncora G2). */
export function CriticalNumber({
  value,
  unit,
  label,
  emphasis = 'default',
  className,
}: CriticalNumberProps) {
  const t = boardTone(EMPHASIS_TONE[emphasis]);
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center rounded-2xl border-2 px-4 py-3 text-center shadow-lg',
        t.panel,
        t.heroRing,
        className,
      )}
    >
      {label ? (
        <span className={cn('font-mono text-[9px] font-bold uppercase tracking-widest', t.columnLabel)}>
          {label}
        </span>
      ) : null}
      <span className={cn('font-body text-3xl font-black leading-none tracking-tight', t.text)}>
        {value}
        {unit ? (
          <span className="ml-1 font-body text-base font-semibold opacity-80">{unit}</span>
        ) : null}
      </span>
    </div>
  );
}
