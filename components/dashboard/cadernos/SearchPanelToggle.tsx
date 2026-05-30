'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

type Props = {
  modulosCount: number;
  children: ReactNode;
};

export function SearchPanelToggle({ modulosCount, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  /** Evita montar `children` duas vezes (painel oculto + sheet no mobile). */
  const [isLgViewport, setIsLgViewport] = useState<boolean | null>(null);

  useEffect(() => {
    setCollapsed(readCollapsedPreference());
    setPreferenceLoaded(true);
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsLgViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (isLgViewport) setMobileOpen(false);
  }, [isLgViewport]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsedPreference(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const panelHeader = (
    <div className="mb-3 px-1">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        Buscar questões ({modulosCount} disponíveis)
      </p>
      <p className="mt-0.5 text-xs font-medium text-cyan-400">100% com NeuroSlide</p>
    </div>
  );

  const mobileSheet =
    portalReady && typeof document !== 'undefined'
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
                  aria-label="Fechar busca de questões"
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Buscar questões"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(90dvh,40rem)] flex-col rounded-t-3xl border border-white/10 bg-[#0d1117] pb-safe shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-white">Buscar questões</p>
                      <p className="text-xs font-medium text-cyan-400">100% com NeuroSlide</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Fechar"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <X size={18} aria-hidden />
                    </button>
                  </div>
                  <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-3">
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  const showDesktopPanel = isLgViewport === true;
  const showMobileChrome = isLgViewport === false;

  return (
    <>
      {showMobileChrome ? (
        <div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-[rgba(0,242,255,0.08)] px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-200 transition-colors hover:bg-[rgba(0,242,255,0.12)]"
          >
            <Search size={14} aria-hidden />
            Buscar questões
          </button>
          {mobileSheet}
        </div>
      ) : null}

      {showDesktopPanel ? (
      <div
        className={cn(
          'min-h-0 shrink-0 flex-col transition-[width] duration-300 flex',
          preferenceLoaded && collapsed ? 'w-12' : 'w-full lg:w-[min(42%,28rem)]',
        )}
      >
        {preferenceLoaded && collapsed ? (
          <div className="sticky top-6 flex h-[calc(100vh-160px)] flex-col items-center gap-2 rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] py-3">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expandir painel de busca"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <Search size={18} className="text-cyan-400/80" aria-hidden />
          </div>
        ) : (
          <div className="sticky top-6 flex h-[calc(100vh-160px)] min-h-0 flex-col">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">{panelHeader}</div>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Recolher painel de busca"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        )}
      </div>
      ) : null}
    </>
  );
}
