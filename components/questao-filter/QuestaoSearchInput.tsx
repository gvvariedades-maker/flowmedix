'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuestaoSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'vitrine' | 'caderno-panel';
  className?: string;
  debounceMs?: never;
};

export function QuestaoSearchInput({
  value,
  onChange,
  placeholder = 'Assunto, banca, slug ou Q-…',
  variant = 'caderno-panel',
  className,
}: QuestaoSearchInputProps) {
  const isCaderno = variant === 'caderno-panel';

  return (
    <div className={cn('relative', className)}>
      <Search
        size={isCaderno ? 14 : 16}
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2',
          isCaderno ? 'left-3 text-slate-500' : 'left-3 text-muted-foreground',
        )}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'w-full outline-none transition-colors',
          isCaderno
            ? 'rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#010409] py-2.5 pl-9 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
            : 'h-11 rounded-2xl border border-border/80 bg-background py-2 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 transition-colors',
            isCaderno
              ? 'right-3 text-slate-500 hover:text-slate-300'
              : 'right-3 text-muted-foreground hover:text-destructive',
          )}
          aria-label="Limpar busca"
        >
          <X size={isCaderno ? 13 : 16} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
