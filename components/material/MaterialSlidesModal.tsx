'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Layers, X } from 'lucide-react';
import {
  getMaterialSlideLot,
  MATERIAL_SLIDE_LOTS,
  type MaterialSlideLotId,
} from '@/components/material/materialSlideLots';
import { MaterialSlidesPlayer } from '@/components/material/MaterialSlidesPlayer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type MaterialSlidesModalProps = {
  open: boolean;
  selectedLot: MaterialSlideLotId;
  onSelectLot: (lot: MaterialSlideLotId) => void;
  onClose: () => void;
};

export function MaterialSlidesModal({ open, selectedLot, onSelectLot, onClose }: MaterialSlidesModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, open]);

  const activeLot = getMaterialSlideLot(selectedLot);

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
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative flex h-dvh w-screen flex-col overflow-hidden bg-[#010409]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Controles flutuantes — não ocupam a coluna do slide */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2 sm:p-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition-colors hover:bg-slate-900/90 sm:text-sm"
                  aria-label="Trocar coleção de NeuroSlides"
                >
                  <Layers size={16} className="text-[#BEF264]" aria-hidden />
                  <span className="max-w-[10rem] truncate sm:max-w-[14rem]">{activeLot.shortTitle}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="z-[60] max-h-[min(22rem,70dvh)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border-white/10 bg-slate-900 p-1 text-slate-100 shadow-2xl"
                >
                  {MATERIAL_SLIDE_LOTS.map((lot) => {
                    const active = lot.id === activeLot.id;
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
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={onClose}
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-slate-950/80 text-slate-200 shadow-lg backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
              <MaterialSlidesPlayer key={selectedLot} immersive selectedLot={selectedLot} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
