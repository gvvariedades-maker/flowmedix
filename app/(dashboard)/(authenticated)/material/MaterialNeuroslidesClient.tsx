'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { MaterialSlidesModal } from '@/components/material/MaterialSlidesModal';
import {
  MATERIAL_SLIDE_LOTS,
  TOTAL_MATERIAL_SLIDES,
  type MaterialSlideLotId,
} from '@/components/material/materialSlideLots';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { cn } from '@/lib/utils';

export default function MaterialNeuroslidesClient() {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<MaterialSlideLotId>(1);

  const openCollection = (lot: MaterialSlideLotId) => {
    setSelectedLot(lot);
    setModalOpen(true);
  };

  return (
    <div className={cn('flex flex-col bg-background text-slate-900', pageBottomPadding)}>
      <div className="shrink-0 border-b border-slate-200 bg-background/95 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/material"
              className="link-editorial-secondary inline-flex w-fit items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft size={18} aria-hidden />
              Voltar ao Material de Apoio
            </Link>
          </div>
          <p className="text-xs font-medium text-slate-500 sm:text-right">
            {TOTAL_MATERIAL_SLIDES} slides · 7 coleções
          </p>
        </div>
      </div>

      <section className="relative px-4 py-12 sm:px-6 md:py-16">
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-[#166534]">
              NeuroSlides para concursos
            </p>
            <h1 className="text-editorial-title text-3xl md:text-4xl">
              Escolha o NeuroSlide que você vai estudar
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              Cada coleção agrupa slides no estilo do Estudo Reverso. Ao abrir, você navega slide a slide em tela
              cheia.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIAL_SLIDE_LOTS.map((lot, idx) => (
              <motion.button
                key={lot.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => openCollection(lot.id)}
                className="card-elevated group flex flex-col p-6 text-left transition-all hover:border-[rgba(34, 197, 94,0.35)] hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(34, 197, 94,0.35)] bg-[rgba(34, 197, 94,0.1)] text-[#166534]">
                  <Layers size={22} aria-hidden />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#166534]">
                  NeuroSlide de {lot.shortTitle}
                </p>
                <h2 className="mt-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl">{lot.title}</h2>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-slate-600">{lot.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-bold text-slate-500">{lot.count} slides</span>
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#166534] group-hover:text-[#2d5010]">
                    Abrir
                    <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <MaterialSlidesModal
        open={modalOpen}
        selectedLot={selectedLot}
        onSelectLot={setSelectedLot}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
