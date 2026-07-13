'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { inferIvExcetoSpectrumSlot, type IvExcetoSpectrumSlot } from '@/lib/slides/puncaoBranchSlideUtils';

export interface IvExcetoConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_STYLE: Record<IvExcetoSpectrumSlot, { chip: string; dot: string }> = {
  comando: { chip: 'bg-rose-100 text-rose-900', dot: 'bg-rose-500' },
  tecnica: { chip: 'bg-sky-100 text-sky-900', dot: 'bg-sky-500' },
  antissepsia: { chip: 'bg-teal-100 text-teal-900', dot: 'bg-teal-500' },
  selecao_veia: { chip: 'bg-indigo-100 text-indigo-900', dot: 'bg-indigo-500' },
  intrusa: { chip: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  geral: { chip: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
};

interface IvExcetoSpectrumConceptMapProps {
  concepts: IvExcetoConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvExcetoSpectrumConceptMap({ concepts, footerRule }: IvExcetoSpectrumConceptMapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const nodes = useMemo(
    () =>
      concepts
        .filter((c) => !/gabarito|letra\s*[a-e]\s*—/i.test(`${c.title} ${c.description}`))
        .slice(0, 5)
        .map((c) => ({
          ...c,
          slot: inferIvExcetoSpectrumSlot(c.title, c.description),
        })),
    [concepts],
  );

  const active = activeIndex !== null ? nodes[activeIndex] : null;
  const toggle = useCallback((i: number) => setActiveIndex((c) => (c === i ? null : i)), []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-950" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-950/50 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-200">
          <Ban className="h-3 w-3" aria-hidden />
          IV EXCETO Spectrum
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {nodes.map((node, i) => {
            const style = SLOT_STYLE[node.slot];
            const isActive = activeIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 transition-all ${
                  isActive
                    ? 'border-cyan-400/60 bg-white/15 ring-2 ring-cyan-400/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase ${style.chip}`}>
                  {node.slot === 'intrusa' ? '?' : 'OK'}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
            >
              <p className="font-body text-sm font-bold text-white">{active.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{active.description}</p>
            </motion.div>
          ) : (
            <p className="text-center font-mono text-[9px] uppercase tracking-widest text-slate-400">
              Toque no nó → técnica sem revelar intrusa
            </p>
          )}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-white/10 px-3 py-2 text-center text-xs italic text-slate-300">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
