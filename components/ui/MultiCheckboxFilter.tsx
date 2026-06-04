'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  /** Texto do botão que abre o picker. Default derivado de searchPlaceholder. */
  addButtonLabel?: string;
  /** Título do sheet mobile. */
  sheetTitle?: string;
};

function deriveAddButtonLabel(searchPlaceholder: string, addButtonLabel?: string): string {
  if (addButtonLabel) return addButtonLabel;
  const match = searchPlaceholder.match(/buscar\s+(.+?)\.{0,3}$/i);
  if (match?.[1]) return `Adicionar ${match[1]}`;
  return 'Adicionar';
}

type PickerListProps = {
  options: string[];
  busca: string;
  setBusca: (value: string) => void;
  onSelect: (option: string) => void;
  searchPlaceholder: string;
  emptySearchLabel: string;
  listboxId?: string;
  className?: string;
  searchSticky?: boolean;
  scrollPaddingBottom?: number;
};

function PickerList({
  options,
  busca,
  setBusca,
  onSelect,
  searchPlaceholder,
  emptySearchLabel,
  listboxId,
  className,
  searchSticky,
  scrollPaddingBottom,
}: PickerListProps) {
  const optionsFiltradas = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(busca.toLowerCase().trim())),
    [options, busca],
  );

  return (
    <div className={className}>
      <div
        className={cn(
          'px-2 pb-2',
          searchSticky && 'sticky top-0 z-10 bg-[#0d1117] pt-2',
        )}
      >
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-[#00f2ff]/40 focus:bg-[#00f2ff]/[0.04]"
        />
      </div>
      <ul
        id={listboxId}
        className={cn(
          'overflow-y-auto overscroll-y-contain py-1',
          searchSticky ? 'min-h-0 flex-1' : 'max-h-64',
        )}
        role="listbox"
        aria-label={searchPlaceholder}
        style={
          scrollPaddingBottom && scrollPaddingBottom > 0
            ? { scrollPaddingBottom: scrollPaddingBottom + 16 }
            : undefined
        }
      >
        {optionsFiltradas.length === 0 ? (
          <li className="py-4 text-center text-xs text-slate-500" role="presentation">
            {emptySearchLabel}
          </li>
        ) : (
          optionsFiltradas.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => onSelect(option)}
                className="flex min-h-[44px] w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-cyan-400/10 hover:text-cyan-100"
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/25 bg-transparent"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 leading-snug">{option}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
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
  addButtonLabel,
  sheetTitle,
}: MultiCheckboxFilterProps) {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [portalReady, setPortalReady] = useState(false);
  const listboxId = useId();

  const selectedSet = useMemo(() => new Set(value), [value]);
  const addLabel = deriveAddButtonLabel(searchPlaceholder, addButtonLabel);
  const title = sheetTitle ?? addLabel;

  const optionsDisponiveis = useMemo(
    () => options.filter((o) => !selectedSet.has(o)),
    [options, selectedSet],
  );

  const closePicker = useCallback(() => {
    setDesktopOpen(false);
    setSheetOpen(false);
    setBusca('');
  }, []);

  const addOption = useCallback(
    (option: string) => {
      if (!selectedSet.has(option)) {
        onChange([...value, option]);
      }
      closePicker();
    },
    [closePicker, onChange, selectedSet, value],
  );

  const removeOption = useCallback(
    (option: string) => {
      onChange(value.filter((v) => v !== option));
    },
    [onChange, value],
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useBodyScrollLock(sheetOpen);
  const keyboardInsetPx = useMobileSheetKeyboardInset(sheetOpen);

  useEffect(() => {
    if (!sheetOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closePicker();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen, closePicker]);

  const mobileSheet =
    portalReady && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {sheetOpen ? (
              <motion.div
                key="multi-checkbox-filter-sheet"
                className="fixed inset-0 z-[200]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Fechar lista de opções"
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                  onClick={closePicker}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(85dvh,32rem)] flex-col rounded-t-3xl border border-white/10 bg-[#0d1117] pb-safe shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-bold text-white">{title}</p>
                    <button
                      type="button"
                      onClick={closePicker}
                      aria-label="Fechar"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <X size={18} aria-hidden />
                    </button>
                  </div>
                  <PickerList
                    options={optionsDisponiveis}
                    busca={busca}
                    setBusca={setBusca}
                    onSelect={addOption}
                    searchPlaceholder={searchPlaceholder}
                    emptySearchLabel={emptySearchLabel}
                    listboxId={listboxId}
                    searchSticky
                    scrollPaddingBottom={keyboardInsetPx}
                    className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden"
                  />
                  <button
                    type="button"
                    className="min-h-[44px] border-t border-white/10 px-4 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                    style={
                      keyboardInsetPx > 0
                        ? { paddingBottom: `calc(0.875rem + ${keyboardInsetPx}px)` }
                        : undefined
                    }
                    onClick={closePicker}
                  >
                    Fechar
                  </button>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn('flex flex-col gap-2', className)}
    >
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selecionados">
          {value.map((item) => (
            <li key={item}>
              <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 py-0.5 pl-2 pr-1 text-xs text-cyan-200">
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => removeOption(item)}
                  disabled={disabled}
                  aria-label={`Remover ${item}`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-cyan-300/80 transition-colors hover:bg-cyan-500/20 hover:text-cyan-100 disabled:opacity-50"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">{emptyLabel}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile: bottom sheet */}
        <div className="md:hidden">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sheetOpen}
            aria-controls={sheetOpen ? listboxId : undefined}
            disabled={disabled || optionsDisponiveis.length === 0}
            onClick={() => {
              if (!disabled) setSheetOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {addLabel}
          </button>
          {mobileSheet}
        </div>

        {/* Desktop: popover */}
        <div className="hidden md:block">
          <Popover
            open={desktopOpen}
            onOpenChange={(v) => {
              setDesktopOpen(v);
              if (!v) setBusca('');
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={desktopOpen}
                disabled={disabled || optionsDisponiveis.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {addLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className={cn('w-auto max-w-[min(100vw-2rem,320px)]', contentMinWidth)}
              align="start"
            >
              <PickerList
                options={optionsDisponiveis}
                busca={busca}
                setBusca={setBusca}
                onSelect={addOption}
                searchPlaceholder={searchPlaceholder}
                emptySearchLabel={emptySearchLabel}
              />
            </PopoverContent>
          </Popover>
        </div>

        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
          >
            Limpar
          </button>
        ) : null}
      </div>
    </div>
  );
}
