'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SELECT_TRIGGER_DARK_PANEL } from '@/components/dashboard/dashboard-select-dark';

export type MultiCheckboxFilterProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyLabel: string;
  disabled?: boolean;
  id?: string;
  'aria-labelledby'?: string;
  /** Largura mínima do painel (assuntos longos). */
  contentMinWidth?: string;
  className?: string;
  searchPlaceholder?: string;
  emptySearchLabel?: string;
};

function buildSummary(value: string[], emptyLabel: string): string {
  if (value.length === 0) return emptyLabel;
  if (value.length <= 2) return value.join(', ');
  return `${value.length} selecionados`;
}

export function MultiCheckboxFilter({
  options,
  value,
  onChange,
  emptyLabel,
  disabled,
  id,
  'aria-labelledby': ariaLabelledBy,
  contentMinWidth = 'min-w-[220px]',
  className,
  searchPlaceholder = 'Buscar...',
  emptySearchLabel = 'Nenhum resultado encontrado',
}: MultiCheckboxFilterProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const summary = useMemo(() => buildSummary(value, emptyLabel), [value, emptyLabel]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const optionsFiltradas = useMemo(
    () =>
      options.filter((o) =>
        o.toLowerCase().includes(busca.toLowerCase().trim()),
      ),
    [options, busca],
  );

  const toggle = (option: string) => {
    if (selectedSet.has(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setBusca('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          className={cn(
            SELECT_TRIGGER_DARK_PANEL,
            'gap-2 text-left',
            value.length === 0 && 'text-slate-400',
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {value.length > 0 && value.length <= 2 ? (
              value.map((item) => (
                <span
                  key={item}
                  className="inline-flex max-w-full truncate rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-xs text-cyan-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="line-clamp-1">{summary}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto max-w-[min(100vw-2rem,320px)]', contentMinWidth)} align="start">
        <div className="px-2 pb-2">
          <input
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-[#00f2ff]/40 focus:bg-[#00f2ff]/[0.04]"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto py-1" role="listbox" aria-multiselectable>
          {optionsFiltradas.length === 0 ? (
            <li className="py-4 text-center text-xs text-slate-500" role="presentation">
              {emptySearchLabel}
            </li>
          ) : (
            optionsFiltradas.map((option) => {
              const checked = selectedSet.has(option);
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(option)}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-200 transition-colors',
                      'hover:bg-cyan-400/10 hover:text-cyan-100',
                      checked && 'bg-cyan-500/5',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        checked
                          ? 'border-[#00f2ff] bg-[#00f2ff] text-[#010409]'
                          : 'border-white/25 bg-transparent',
                      )}
                      aria-hidden
                    >
                      {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{option}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        {value.length > 0 ? (
          <div className="border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
            >
              Limpar
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
