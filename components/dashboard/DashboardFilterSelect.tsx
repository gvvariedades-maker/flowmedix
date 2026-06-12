'use client';

import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FILTER_ALL_VALUE,
  SELECT_CONTENT_EDITORIAL,
  SELECT_ITEM_EDITORIAL,
  SELECT_TRIGGER_EDITORIAL_PANEL,
} from '@/components/dashboard/dashboard-select-editorial';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';

const FILTER_ALL = FILTER_ALL_VALUE;

export type DashboardFilterSelectProps = {
  id?: string;
  'aria-labelledby'?: string;
  placeholder: string;
  allLabel: string;
  sheetTitle?: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  variant?: 'default' | 'panel';
};

export function DashboardFilterSelect({
  id,
  'aria-labelledby': ariaLabelledBy,
  placeholder,
  allLabel,
  sheetTitle,
  value,
  options,
  disabled = false,
  onValueChange,
  triggerClassName,
  variant = 'default',
}: DashboardFilterSelectProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const portalReady = useClientMounted();
  const listboxId = useId();

  const displayLabel = value || allLabel;
  const selectValue = value || FILTER_ALL;
  const title = sheetTitle ?? placeholder;

  const handleChange = useCallback(
    (next: string) => {
      onValueChange(next === FILTER_ALL ? '' : next);
    },
    [onValueChange],
  );

  useBodyScrollLock(sheetOpen);
  const keyboardInsetPx = useMobileSheetKeyboardInset(sheetOpen);

  useEffect(() => {
    if (!sheetOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setSheetOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen]);

  const defaultTriggerClass =
    'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm text-foreground shadow-sm [&>span]:line-clamp-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const mobileTriggerClass = cn(
    variant === 'panel' ? SELECT_TRIGGER_EDITORIAL_PANEL : defaultTriggerClass,
    triggerClassName,
  );

  const desktopTriggerClass = cn(
    variant === 'panel' ? SELECT_TRIGGER_EDITORIAL_PANEL : 'h-11 w-full rounded-xl',
    triggerClassName,
  );

  const sheetItems = [{ value: '', label: allLabel }, ...options.map((o) => ({ value: o, label: o }))];

  const mobileSheet =
    portalReady && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {sheetOpen ? (
              <motion.div
                key="filter-select-sheet"
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
                  onClick={() => setSheetOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(85dvh,32rem)] flex-col rounded-t-3xl border border-slate-200 bg-white pb-safe shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      aria-label="Fechar"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    >
                      <X size={18} aria-hidden />
                    </button>
                  </div>
                  <ul
                    id={listboxId}
                    role="listbox"
                    aria-label={title}
                    className="custom-scrollbar flex-1 overflow-y-auto overscroll-y-contain px-2 py-2"
                    style={
                      keyboardInsetPx > 0
                        ? { scrollPaddingBottom: keyboardInsetPx + 16 }
                        : undefined
                    }
                  >
                    {sheetItems.map((item) => {
                      const selected = value === item.value;
                      return (
                        <li key={item.value || FILTER_ALL} role="none">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              handleChange(item.value || FILTER_ALL);
                              setSheetOpen(false);
                            }}
                            className={cn(
                              'flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors',
                              selected
                                ? 'bg-[rgba(34, 197, 94,0.10)] font-semibold text-[#166534]'
                                : 'text-slate-700 hover:bg-slate-50',
                            )}
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                              {selected ? <Check className="h-4 w-4 text-[#166534]" /> : null}
                            </span>
                            <span className="min-w-0 flex-1">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    type="button"
                    className="min-h-[44px] border-t border-slate-200 px-4 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    style={
                      keyboardInsetPx > 0
                        ? { paddingBottom: `calc(0.875rem + ${keyboardInsetPx}px)` }
                        : undefined
                    }
                    onClick={() => setSheetOpen(false)}
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
    <>
      <div className="md:hidden">
        <button
          type="button"
          id={id}
          aria-labelledby={ariaLabelledBy}
          aria-haspopup="listbox"
          aria-expanded={sheetOpen}
          aria-controls={sheetOpen ? listboxId : undefined}
          disabled={disabled}
          onClick={() => {
            if (!disabled) setSheetOpen(true);
          }}
          className={mobileTriggerClass}
        >
          <span className="line-clamp-1 text-left">{displayLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
        {mobileSheet}
      </div>

      <div className="hidden md:block">
        <Select value={selectValue} disabled={disabled} onValueChange={handleChange}>
          <SelectTrigger id={id} aria-labelledby={ariaLabelledBy} className={desktopTriggerClass}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper" className={SELECT_CONTENT_EDITORIAL}>
            <SelectItem value={FILTER_ALL} className={SELECT_ITEM_EDITORIAL}>
              {allLabel}
            </SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option} className={SELECT_ITEM_EDITORIAL}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
