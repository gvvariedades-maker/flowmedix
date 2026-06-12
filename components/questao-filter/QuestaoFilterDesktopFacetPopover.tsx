'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type QuestaoFilterDesktopFacetPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  searchPlaceholder: string;
  emptySearchLabel: string;
  disabled?: boolean;
};

/** Popover multi-select de banca/assunto — desktop vitrine (acionado pelos chips). */
export function QuestaoFilterDesktopFacetPopover({
  open,
  onOpenChange,
  title,
  options,
  selected,
  onChange,
  searchPlaceholder,
  emptySearchLabel,
  disabled,
}: QuestaoFilterDesktopFacetPopoverProps) {
  const [busca, setBusca] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const optionsFiltradas = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(busca.toLowerCase().trim())),
    [busca, options],
  );

  const toggleOption = (option: string) => {
    if (disabled) return;
    if (selectedSet.has(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setBusca('');
      }}
    >
      <PopoverAnchor className="pointer-events-none absolute left-0 top-full h-px w-px" aria-hidden />
      <PopoverContent
        variant="editorial"
        align="start"
        side="bottom"
        className="w-[min(100vw-2rem,320px)] p-0"
        aria-label={title}
      >
        <div className="border-b border-slate-200 px-3 py-2">
          <p className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-700">{options.length}</span>{' '}
            {options.length === 1 ? 'opção' : 'opções'}
            {selected.length > 0 ? (
              <>
                {' · '}
                <span className="font-semibold tabular-nums text-[#166534]">{selected.length}</span>{' '}
                selecionada{selected.length !== 1 ? 's' : ''}
              </>
            ) : null}
          </p>
        </div>
        <div className="p-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={disabled}
            className="input-editorial w-full px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
        <div className="bg-white">
          <ul
            className="editorial-scrollbar max-h-64 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-white py-1"
            role="listbox"
            aria-label={title}
          >
            {optionsFiltradas.length === 0 ? (
              <li className="py-4 text-center text-xs text-slate-500" role="presentation">
                {emptySearchLabel}
              </li>
            ) : (
              optionsFiltradas.map((option) => {
                const isSelected = selectedSet.has(option);
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={disabled}
                      onClick={() => toggleOption(option)}
                      className="flex min-h-[40px] w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          isSelected
                            ? 'border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.15)] text-[#166534]'
                            : 'border-slate-300 bg-transparent',
                        )}
                        aria-hidden
                      >
                        {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">{option}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
