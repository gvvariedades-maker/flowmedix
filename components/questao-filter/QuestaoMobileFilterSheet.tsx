'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';
import { cn } from '@/lib/utils';

export type QuestaoMobileFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  searchPlaceholder: string;
  emptySearchLabel: string;
  disabled?: boolean;
};

/** Sheet multi-select de banca/assunto (mobile vitrine e caderno). */
export function QuestaoMobileFilterSheet({
  open,
  onClose,
  title,
  options,
  selected,
  onChange,
  searchPlaceholder,
  emptySearchLabel,
  disabled,
}: QuestaoMobileFilterSheetProps) {
  const [busca, setBusca] = useState('');
  const portalReady = useClientMounted();
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const optionsFiltradas = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(busca.toLowerCase().trim())),
    [options, busca],
  );

  const closeSheet = useCallback(() => {
    onClose();
    setBusca('');
  }, [onClose]);

  const toggleOption = useCallback(
    (option: string) => {
      if (disabled) return;
      if (selectedSet.has(option)) {
        onChange(selected.filter((v) => v !== option));
      } else {
        onChange([...selected, option]);
      }
    },
    [disabled, onChange, selected, selectedSet],
  );

  useBodyScrollLock(open);
  const keyboardInsetPx = useMobileSheetKeyboardInset(open);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeSheet();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeSheet]);

  if (!portalReady || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="questao-mobile-filter-sheet"
          className="fixed inset-0 z-[200] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar filtros"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeSheet}
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
                onClick={closeSheet}
                aria-label="Fechar"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  disabled={disabled}
                  className="input-editorial w-full px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
              <ul
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1"
                role="listbox"
                aria-label={searchPlaceholder}
                style={
                  keyboardInsetPx > 0
                    ? { scrollPaddingBottom: keyboardInsetPx + 16 }
                    : undefined
                }
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
                          className="flex min-h-[44px] w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
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
                            {isSelected ? <CheckCircle2 className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">{option}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <button
              type="button"
              className="min-h-[44px] border-t border-slate-200 px-4 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              style={
                keyboardInsetPx > 0
                  ? { paddingBottom: `calc(0.875rem + ${keyboardInsetPx}px)` }
                  : undefined
              }
              onClick={closeSheet}
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
