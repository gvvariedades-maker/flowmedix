'use client';

import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { useCallback, useEffect, useImperativeHandle, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';

const STORAGE_KEY = 'avant.caderno.search-panel.collapsed';

function readCollapsedPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistCollapsedPreference(collapsed: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  } catch {
    // LocalStorage pode estar bloqueado; preferência vale só na sessão.
  }
}

export type SearchPanelToggleHandle = {
  open: () => void;
};

type Props = {
  modulosCount: number;
  children: ReactNode;
  panelRef?: Ref<SearchPanelToggleHandle>;
  initialOpen?: boolean;
};

export function SearchPanelToggle({ modulosCount, children, panelRef, initialOpen = false }: Props) {
  const mounted = useClientMounted();
  const [collapsed, setCollapsed] = useState(false);
  const [prefSynced, setPrefSynced] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(initialOpen);
  const [initialOpenApplied, setInitialOpenApplied] = useState(false);

  const openPanel = useCallback(() => {
    setCollapsed(false);
    setMobileOpen(true);
  }, []);

  useImperativeHandle(panelRef, () => ({ open: openPanel }), [openPanel]);

  useEffect(() => {
    if (!initialOpen || initialOpenApplied) return;
    const id = window.requestAnimationFrame(() => {
      openPanel();
      setInitialOpenApplied(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [initialOpen, initialOpenApplied, openPanel]);

  if (mounted && !prefSynced) {
    setPrefSynced(true);
    setCollapsed(readCollapsedPreference());
  }

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsedPreference(next);
      return next;
    });
  }, []);

  useBodyScrollLock(mobileOpen);
  const keyboardInsetPx = useMobileSheetKeyboardInset(mobileOpen);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const panelHeader = (
    <div className="mb-3 px-1">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Inserir questões ({modulosCount} disponíveis)
      </p>
      <p className="mt-0.5 text-xs font-medium text-[#3d6b0f]">100% com NeuroSlide</p>
    </div>
  );

  const mobileSheet =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {mobileOpen ? (
              <motion.div
                key="caderno-search-sheet"
                className="fixed inset-0 z-[200] lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Fechar painel de inserir questões"
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Inserir questões"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(90dvh,40rem)] min-h-0 flex-col rounded-t-3xl border border-slate-200 bg-white pb-safe shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Inserir questões</p>
                      <p className="text-xs font-medium text-[#3d6b0f]">100% com NeuroSlide</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Fechar"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    >
                      <X size={18} aria-hidden />
                    </button>
                  </div>
                  <div
                    className="custom-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain touch-pan-y p-4 pt-3 lg:overflow-hidden"
                    style={
                      keyboardInsetPx > 0
                        ? { paddingBottom: keyboardInsetPx + 16 }
                        : undefined
                    }
                  >
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-editorial-outline mb-3 min-h-[44px] w-full text-xs font-bold uppercase tracking-widest"
        >
          <Search size={14} aria-hidden />
          Inserir questões
        </button>
        {mobileSheet}
      </div>

      <div
        className={cn(
          'hidden min-h-0 shrink-0 flex-col transition-[width] duration-300 lg:flex',
          mounted && collapsed ? 'w-12' : 'w-full lg:w-[min(42%,28rem)]',
        )}
      >
        {mounted && collapsed ? (
          <div className="card-elevated sticky top-6 flex h-[calc(100vh-160px)] flex-col items-center gap-2 py-3">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expandir painel de inserir questões"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-[rgba(143,224,32,0.35)] hover:text-[#3d6b0f]"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expandir painel de inserir questões"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#3d6b0f]/80 transition-colors hover:text-[#3d6b0f]"
            >
              <Search size={18} aria-hidden />
            </button>
          </div>
        ) : (
          <div className="sticky top-6 flex h-[calc(100vh-160px)] min-h-0 flex-col">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">{panelHeader}</div>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Recolher painel de inserir questões"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-[rgba(143,224,32,0.35)] hover:text-[#3d6b0f]"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        )}
      </div>
    </>
  );
}
