'use client';

import { Minus, Plus, Type } from 'lucide-react';
import { useTextSize } from '@/components/providers/TextSizeProvider';
import { cn } from '@/lib/utils';

type TextSizeControlProps = {
  /** `light`: sidebar clara. `dark`: landing / fundo escuro. */
  variant?: 'light' | 'dark';
  /** Só ícones +/− (ex.: header da landing). */
  compact?: boolean;
  className?: string;
};

export function TextSizeControl({
  variant = 'light',
  compact = false,
  className,
}: TextSizeControlProps) {
  const { decrease, increase, canDecrease, canIncrease, label } = useTextSize();

  const btnBase =
    variant === 'dark'
      ? 'rounded-lg text-white/90 transition hover:bg-white/10 active:bg-white/15 disabled:opacity-35 disabled:pointer-events-none'
      : 'rounded-lg text-foreground transition hover:bg-muted active:bg-muted/80 disabled:opacity-35 disabled:pointer-events-none';

  const border =
    variant === 'dark' ? 'border-white/15 bg-white/5' : 'border-border bg-muted/30';

  if (compact) {
    return (
      <div
        className={cn('inline-flex items-center gap-0.5 rounded-xl border p-0.5', border, className)}
        role="group"
        aria-label="Tamanho do texto da plataforma"
      >
        <button
          type="button"
          onClick={decrease}
          disabled={!canDecrease}
          className={cn('flex h-9 w-9 items-center justify-center sm:h-8 sm:w-8', btnBase)}
          aria-label="Diminuir tamanho do texto"
        >
          <Minus className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </button>
        <span
          className={cn(
            'hidden min-w-[4.5rem] text-center text-[10px] font-bold uppercase tracking-wide sm:inline',
            variant === 'dark' ? 'text-white/55' : 'text-muted-foreground'
          )}
          aria-live="polite"
        >
          {label}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={!canIncrease}
          className={cn('flex h-9 w-9 items-center justify-center sm:h-8 sm:w-8', btnBase)}
          aria-label="Aumentar tamanho do texto"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl border p-3', border, className)}
      role="region"
      aria-label="Tamanho do texto da plataforma"
    >
      <div className="mb-2 flex items-center gap-2">
        <Type
          size={14}
          className={variant === 'dark' ? 'text-white/55' : 'text-muted-foreground'}
          aria-hidden
        />
        <span
          className={cn(
            'text-[10px] font-black uppercase tracking-widest',
            variant === 'dark' ? 'text-white/60' : 'text-muted-foreground'
          )}
        >
          Tamanho do texto
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={decrease}
          disabled={!canDecrease}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            btnBase,
            variant === 'light' && 'border border-border bg-card shadow-sm'
          )}
          aria-label="Diminuir tamanho do texto"
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} />
        </button>
        <span
          className={cn(
            'min-w-0 flex-1 text-center text-xs font-bold tabular-nums',
            variant === 'dark' ? 'text-white/90' : 'text-foreground'
          )}
          aria-live="polite"
        >
          {label}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={!canIncrease}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center',
            btnBase,
            variant === 'light' && 'border border-border bg-card shadow-sm'
          )}
          aria-label="Aumentar tamanho do texto"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
