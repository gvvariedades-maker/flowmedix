'use client';

import { Minus, Plus, Type } from 'lucide-react';
import { useTextSize } from '@/components/providers/TextSizeProvider';
import { cn } from '@/lib/utils';

type TextSizeControlProps = {
  /** `light`: sidebar clara. `dark`: landing / fundo escuro. */
  variant?: 'light' | 'dark';
  /** Só ícones +/− (ex.: header da landing). */
  compact?: boolean;
  /** Controles “inline”: sem caixa com borda (sidebar premium). */
  embedded?: boolean;
  className?: string;
};

export function TextSizeControl({
  variant = 'light',
  compact = false,
  embedded = false,
  className,
}: TextSizeControlProps) {
  const { decrease, increase, canDecrease, canIncrease, label } = useTextSize();

  const btnBase =
    variant === 'dark'
      ? 'rounded-lg text-white/90 transition hover:bg-white/10 active:bg-white/15 disabled:opacity-35 disabled:pointer-events-none'
      : 'rounded-lg text-foreground transition hover:bg-muted active:bg-muted/80 disabled:opacity-35 disabled:pointer-events-none';

  const border =
    variant === 'dark' ? 'border-white/15 bg-white/5' : 'border-border bg-muted/30';

  if (compact && embedded) {
    return (
      <div
        className={cn('inline-flex items-center gap-0.5 rounded-full bg-slate-200/50 p-0.5', className)}
        role="group"
        aria-label="Tamanho do texto da plataforma"
      >
        <button
          type="button"
          onClick={decrease}
          disabled={!canDecrease}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/80 active:bg-white disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Diminuir tamanho do texto"
        >
          <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        </button>
        <span
          className={cn(
            'min-w-[3.5rem] text-center text-[10px] font-bold uppercase tracking-wide',
            variant === 'dark' ? 'text-white/70' : 'text-slate-500'
          )}
          aria-live="polite"
        >
          {label}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={!canIncrease}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/80 active:bg-white disabled:opacity-35 disabled:pointer-events-none"
          aria-label="Aumentar tamanho do texto"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  if (compact && !embedded) {
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

  if (embedded && variant === 'light') {
    return (
      <div className={cn('space-y-3', className)} role="region" aria-label="Tamanho do texto da plataforma">
        <div className="flex items-center gap-2 text-slate-500">
          <Type size={15} className="shrink-0" strokeWidth={2.25} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Tamanho do texto</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={decrease}
            disabled={!canDecrease}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/55 text-slate-800 transition hover:bg-slate-300/60 active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none"
            aria-label="Diminuir tamanho do texto"
          >
            <Minus className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <span
            className="min-w-[4rem] text-center text-xs font-bold tabular-nums text-slate-800"
            aria-live="polite"
          >
            {label}
          </span>
          <button
            type="button"
            onClick={increase}
            disabled={!canIncrease}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/55 text-slate-800 transition hover:bg-slate-300/60 active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none"
            aria-label="Aumentar tamanho do texto"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
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
