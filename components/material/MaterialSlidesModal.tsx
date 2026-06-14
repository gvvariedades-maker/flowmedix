'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Layers, PanelLeft, X } from 'lucide-react';
import {
  getMaterialSlideLot,
  MATERIAL_SLIDE_LOTS,
  type MaterialSlideLotId,
} from '@/components/material/materialSlideLots';
import {
  ReadableTextZoomProvider,
  ReadableTextZoomToolbar,
} from '@/components/accessibility/ReadableTextZoom';
import { MaterialSlidesPlayer } from '@/components/material/MaterialSlidesPlayer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';

type MaterialSlidesModalProps = {
  open: boolean;
  selectedLot: MaterialSlideLotId;
  onSelectLot: (lot: MaterialSlideLotId) => void;
  onClose: () => void;
};

function stopInnerEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

type LotSelectionProps = {
  activeLotId: MaterialSlideLotId;
  onSelectLot: (id: MaterialSlideLotId) => void;
};

function MaterialLotDropdownItems({ activeLotId, onSelectLot }: LotSelectionProps) {
  return (
    <>
      {MATERIAL_SLIDE_LOTS.map((lot) => {
        const active = lot.id === activeLotId;
        return (
          <DropdownMenuItem
            key={lot.id}
            className="cursor-pointer text-slate-100 focus:bg-white/10 focus:text-white"
            onSelect={() => onSelectLot(lot.id)}
          >
            <span className="flex items-start gap-2">
              <span className="flex w-4 shrink-0 justify-center pt-0.5" aria-hidden>
                {active ? <Check size={16} className="text-[#BEF264]" /> : null}
              </span>
              <span className={active ? 'font-black' : 'font-medium'}>
                NeuroSlide de {lot.shortTitle}
                <span className="mt-0.5 block text-xs font-normal text-slate-400">{lot.count} slides</span>
              </span>
            </span>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}

function MaterialLotDrawerList({ activeLotId, onSelectLot }: LotSelectionProps) {
  return (
    <div className="flex flex-col gap-1" role="listbox" aria-label="Coleções de NeuroSlides">
      {MATERIAL_SLIDE_LOTS.map((lot) => {
        const active = lot.id === activeLotId;
        return (
          <button
            key={lot.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelectLot(lot.id)}
            className={[
              'flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors',
              active ? 'bg-white/10 ring-1 ring-[#BEF264]/35' : 'hover:bg-white/5',
            ].join(' ')}
          >
            <span className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
              {active ? <Check size={18} className="text-[#BEF264]" /> : <span className="h-[18px] w-[18px]" />}
            </span>
            <span className={`min-w-0 ${active ? 'font-black text-white' : 'font-medium text-slate-200'}`}>
              NeuroSlide de {lot.shortTitle}
              <span className="mt-0.5 block text-xs font-normal text-slate-400">{lot.count} slides</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MaterialSlidesModal({ open, selectedLot, onSelectLot, onClose }: MaterialSlidesModalProps) {
  const [lotPickerOpen, setLotPickerOpen] = useState(false);
  const [slideIndexByLot, setSlideIndexByLot] = useState<
    Partial<Record<MaterialSlideLotId, number>>
  >({});
  const [prevOpen, setPrevOpen] = useState(open);
  const slideIndex = slideIndexByLot[selectedLot] ?? 0;
  const setSlideIndex = useCallback(
    (index: number) => {
      setSlideIndexByLot((prev) => ({ ...prev, [selectedLot]: index }));
    },
    [selectedLot],
  );

  if (open !== prevOpen) {
    setPrevOpen(open);
    setLotPickerOpen(false);
  }

  const handleSelectLot = useCallback(
    (id: MaterialSlideLotId) => {
      onSelectLot(id);
      setLotPickerOpen(false);
    },
    [onSelectLot],
  );

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (lotPickerOpen) {
        setLotPickerOpen(false);
        return;
      }
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lotPickerOpen, onClose, open]);

  const activeLot = getMaterialSlideLot(selectedLot);

  const triggerClassName =
    'pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition-colors hover:bg-slate-900/90 active:bg-slate-800 sm:text-sm';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 bg-[#010409]"
          role="dialog"
          aria-modal="true"
          aria-label={`NeuroSlides, coleção ${activeLot.shortTitle}`}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <ReadableTextZoomProvider contentKey={`${selectedLot}-${slideIndex}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative flex h-dvh w-screen flex-col overflow-hidden bg-[#010409]"
            onPointerDown={stopInnerEvent}
            onMouseDown={stopInnerEvent}
            onTouchStart={stopInnerEvent}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2 sm:p-3">
              <div className="hidden md:block pointer-events-auto">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    type="button"
                    className={triggerClassName}
                    aria-haspopup="menu"
                    aria-label="Trocar coleção de NeuroSlides"
                  >
                    <Layers size={16} className="text-[#BEF264]" aria-hidden />
                    <span className="max-w-[14rem] truncate">{activeLot.shortTitle}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[60] max-h-[min(22rem,70dvh)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border-white/10 bg-slate-900 p-1 text-slate-100 shadow-2xl"
                  >
                    <MaterialLotDropdownItems activeLotId={activeLot.id} onSelectLot={handleSelectLot} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                type="button"
                className={`md:hidden ${triggerClassName}`}
                onClick={() => setLotPickerOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={lotPickerOpen}
                aria-label="Abrir menu de coleções"
              >
                <PanelLeft size={18} className="shrink-0 text-[#BEF264]" aria-hidden />
                <Layers size={14} className="text-[#BEF264]" aria-hidden />
                <span className="max-w-[8.5rem] truncate">{activeLot.shortTitle}</span>
              </button>

              <div className="pointer-events-auto flex items-center gap-2">
                <ReadableTextZoomToolbar
                  ariaLabel="Tamanho do texto do NeuroSlide"
                  variant="cyber"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-slate-950/80 text-slate-200 shadow-lg backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white active:bg-white/15"
                  aria-label="Fechar"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>

            <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
              <MaterialSlidesPlayer
                key={selectedLot}
                immersive
                selectedLot={selectedLot}
                onIndexChange={setSlideIndex}
              />
            </div>

            <AnimatePresence>
              {lotPickerOpen ? (
                <motion.div
                  key="lot-picker-overlay"
                  className="fixed inset-0 z-[100] md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Fechar menu de coleções"
                    className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setLotPickerOpen(false);
                    }}
                  />

                  <motion.aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Escolha a coleção de NeuroSlides"
                    initial={{ x: '-104%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-104%' }}
                    transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                    className="absolute inset-y-0 left-0 z-[101] flex w-[min(20rem,calc(100vw-3rem))] max-w-[100%] flex-col border-r border-white/10 bg-slate-950 shadow-2xl"
                    onPointerDown={stopInnerEvent}
                    onTouchStart={stopInnerEvent}
                  >
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#BEF264]/30 bg-[#BEF264]/10 text-[#BEF264]">
                        <Layers size={20} aria-hidden />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEF264]">Coleções</p>
                        <p className="text-sm font-black text-white">NeuroSlides</p>
                      </div>
                    </div>
                    <nav className="custom-scrollbar flex-1 overflow-y-auto overscroll-y-contain px-2 py-3">
                      <MaterialLotDrawerList activeLotId={activeLot.id} onSelectLot={handleSelectLot} />
                    </nav>
                    <button
                      type="button"
                      className="border-t border-white/10 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-slate-400 hover:bg-white/5 hover:text-white"
                      onClick={() => setLotPickerOpen(false)}
                    >
                      Fechar menu
                    </button>
                  </motion.aside>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
          </ReadableTextZoomProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
